from dataclasses import dataclass
import argparse
from abc import ABC, abstractmethod
import dataclasses
import json
import logging
import os
from pathlib import Path
import traceback
from typing import Dict, List, Tuple
import shlex
import subprocess
import hvac

import requests
import toml

def setup_logger(name: str = "portrai_vault_setup", log_file: str | Path | None = None) -> logging.Logger:
    """Create a logger that prints to console and optionally to a file."""
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Format
    formatter = logging.Formatter('%(asctime)s | %(levelname)s :: %(message)s')
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    if log_file:
        Path(log_file).parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

vault_dir = os.path.dirname(__file__)

logger = setup_logger(log_file=os.path.join(vault_dir,"portrai_vault_setup.log"))

class Cmd(ABC):
    @abstractmethod
    def run(self, cfg:dict) -> bool:
        """This method must be implemented by all classes that implement Cmd"""
        return False

class Config:
    @staticmethod
    def parse(path:str) -> Dict[str,Dict[str,any]]:
        if not os.path.exists(path):
            return {}
        with open(path, 'r') as file:
            data = toml.load(file)
        return data


@dataclass
class UnsealedKey:
    Key_B64         : str
    Seal_Type       : str
    Initialized     : bool
    Sealed          : bool
    Total_Shares    : int
    Threshold       : int
    Version         : str
    Build_Date      : str
    Storage_Type    : str
    Cluster_Name    : str
    Cluster_ID      : str
    HA_Enabled      : bool

    @staticmethod
    def extract(key_b64:str,lines:List[str]):
        Seal_Type       = None
        Initialized     = None
        Sealed          = None
        Total_Shares    = None
        Threshold       = None
        Version         = None
        Build_Date      = None
        Storage_Type    = None
        Cluster_Name    = None
        Cluster_ID      = None
        HA_Enabled      = None
        
        for line in lines:
            value = line.split()[-1]
            if "Seal Type" in line:
                Seal_Type = value
            elif "Initialized" in line:
                Initialized = bool(value)
            elif "Sealed" in line:
                Sealed = bool(value)
            elif "Total Shares" in line:
                Total_Shares = int(value)
            elif "Threshold" in line:
                Threshold = int(value)
            elif "Version" in line:
                Version = value
            elif "Build Date" in line:
                Build_Date = value
            elif "Storage Type" in line:
                Storage_Type = value
            elif "Cluster Name" in line:
                Cluster_Name = value
            elif "Cluster ID" in line:
                Cluster_ID = value
            elif "HA Enabled" in line:
                HA_Enabled = bool(value)

        return UnsealedKey(        
            Key_B64         = key_b64,
            Seal_Type       = Seal_Type,
            Initialized     = Initialized,
            Sealed          = Sealed,
            Total_Shares    = Total_Shares,
            Threshold       = Threshold,
            Version         = Version,
            Build_Date      = Build_Date,
            Storage_Type    = Storage_Type,
            Cluster_Name    = Cluster_Name,
            Cluster_ID      = Cluster_ID,
            HA_Enabled      = HA_Enabled,
        )


def create_kv_engine(client:hvac.Client, path:str, backend_type:str, options:dict):
    response : requests.Response = client.sys.enable_secrets_engine(
        backend_type=backend_type,
        path=path,
        options=options
    )
    if response.ok :
        logger.info(f"KV engine '{path}' created successfully.")
        return True
    else :
        logger.error(f"KV engine '{path}' creation failed.")
        return False

def create_policy(client:hvac.Client, name:str, path:str):
    policy = f'''
    path "{path}/*" {{
        capabilities = ["create", "read", "update", "delete", "list"]
    }}
    '''
    response : requests.Response = client.sys.create_or_update_policy(
        name=name,
        policy=policy
    )
    if response.ok :
        logger.info(f"Policy '{name}' created successfully.")
        return True
    else :
        logger.error(f"Policy '{name}' creation failed.")
        return False

def create_token(client:hvac.Client, policy_name:str):
    token = client.auth.token.create(policies=[policy_name])
    if "auth" in token and "client_token" in token["auth"]:
        logger.info(f"Token with policy '{policy_name}' created: {token['auth']['client_token']}")
        return token['auth']['client_token']
    else :
        logger.error(f"Token with policy '{policy_name}' creation failed")
        return None

def create_secret(client:hvac.Client, path, mount_point, secret_value):
    response = client.secrets.kv.v2.create_or_update_secret(
        path=path,
        mount_point=mount_point,
        secret=dict(value=secret_value)
    )
    if len(response) > 0:
        logger.info(f"Secret '{mount_point}' created successfully in '{path}'.")
        return True
    else :
        logger.error(f"Secret '{mount_point}' creation failed in '{path}'.")
        return False

def create_password_policy(client:hvac.Client, policy_name:str, policy_file:str):
    with open(policy_file, 'r') as file:
        policy = file.read()
    
    policy_path = f'sys/policies/password/{policy_name}'
    response : requests.Response = client.write(policy_path, policy=policy)
    if response.ok :
        logger.info(f"Password policy '{policy_name}' created successfully.")
        return True
    else :
        logger.error(f"Password policy '{policy_name}' creation failed.")
        return False

def generate_pwd(client:hvac.Client,policy_name:str):
    read_path = f"sys/policies/password/{policy_name}/generate"
    result = client.read(read_path)
    
    if "data" in result and "password" in result["data"]:
        password = result['data']['password']
        return password
    else :
        logger.error(f"Password cannot be generated on {read_path}")
        return False
    
def generate_key(client:hvac.Client, key_name:str):
    response = client.secrets.transit.create_key(name=key_name)

    if len(response) > 0:
        logger.info(f"INFO : Transit key '{key_name}' created successfully.")
        return True
    else :
        logger.error(f"Transit key '{key_name}' creation failed.")
        return False

def generate_strong_key(client:hvac.Client, key_name:str):
    response = client.secrets.transit.generate_data_key(
        name=key_name,
        key_type='plaintext'
    )
    if "data" in response and "plaintext" in response["data"]:
        return response['data']['plaintext']
    else :
        logger.error(f"falied to generate strong key for {key_name}")
        return None

def seal_vault(container_name:str, root_token:str):
    cmd = f'docker exec {container_name} sh -c "VAULT_TOKEN={root_token} vault operator seal"'
    logger.debug(f"sealing with cmd : {cmd.replace(root_token,"*secret*")}")
    try:
        result = subprocess.run(shlex.split(cmd), capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"cmd stderr :\n{e.stderr}")
        return False
    if result.returncode == 0:
        logger.info("Vault has been sealed successfully.")
        return True
    else :
        logger.error("Vault has not been sealed.")
        return False

def unseal_vault(client:hvac.Client, unseal_keys:List[str]):
    # Check if the Vault is already unsealed
    if not client.sys.is_sealed():
        logger.info("Vault is already unsealed.")
        return True

    # Unseal the Vault
    shares = len(unseal_keys)
    threshold = shares  # Assuming all shares are needed

    for key in unseal_keys:
        result = client.sys.submit_unseal_key(key)
        
        if not result['sealed']:
            logger.info("Vault unsealed successfully.")
            return True
        
        logger.info(f"Progress: {result['progress']}/{threshold}")

    logger.error("Failed to unseal the Vault.")
    return False

@dataclass
class Seal(Cmd):
    dev : bool

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('seal', help="Seal the vault")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.set_defaults(func=lambda args : Seal(
            dev=args.dev
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Sealing vault ...")

        container_name = cfg.get("vault",{}).get("container_name","vault")
        initialization_tokens_path = cfg.get("vault",{}).get("initialization_tokens_path",os.path.join(vault_dir,"root_tokens.json"))

        with open(initialization_tokens_path,"r") as f:
            root_tokens = json.load(f)
        return seal_vault(container_name=container_name, root_token=root_tokens["root_token"])


@dataclass
class Unseal(Cmd):
    dev : bool

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('unseal', help="Unseal the vault")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.set_defaults(func=lambda args : Unseal(
            dev=args.dev
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Unsealing vault ...")

        url = cfg.get("vault",{}).get("url","http://127.0.0.1:8200")
        initialization_tokens_path = cfg.get("vault",{}).get("initialization_tokens_path",os.path.join(vault_dir,"root_tokens.json"))

        with open(initialization_tokens_path,"r") as f:
            root_tokens = json.load(f)
        
        client = hvac.Client(
            url=url,
            token=root_tokens["root_token"]
        )
        unseal_keys = [UnsealedKey(**keys_json) for keys_json in root_tokens["unseal_keys"]]

        return unseal_vault(client,unseal_keys=[k.Key_B64 for k in unseal_keys])


@dataclass
class Gen(Cmd):
    dev : bool
    output : str

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('gen', help="generate secret in the vault")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.add_argument('-o','--output',dest="output", choices=["json","env"],default="env", help="output of the generated secrets")
        parser.set_defaults(func=lambda args : Gen(
            dev=args.dev,
            output=args.output,
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Generating secrets ...")

        url = cfg.get("vault",{}).get("url","http://127.0.0.1:8200")
        output_path = cfg.get("vault",{}).get("output_path","secrets")
        initialization_tokens_path = cfg.get("vault",{}).get("initialization_tokens_path",os.path.join(vault_dir,"root_tokens.json"))

        logger.debug(initialization_tokens_path)
        secrets_cfg = cfg.get("vault",{}).get("secrets", {})

        with open(initialization_tokens_path,"r") as f:
            root_tokens = json.load(f)

        client = hvac.Client(
            url=url,
            token=root_tokens["root_token"]
        )
        if not client.is_authenticated():
            logger.error("vault authentication failed")
            return
        
        secrets = {}

        for secret_name, secret_cfg in secrets_cfg.items() :
            is_read_only =  secret_cfg.get("read_only",False)
            if is_read_only : continue
            secret_type =  secret_cfg.get("type","pwd").lower()
            engine =  secret_cfg.get("engine").lower()
            name =  secret_cfg.get("name").lower()
            mount =  secret_cfg.get("mount").lower()
            if "pwd" == secret_type:
                pwd = generate_pwd(client,"pwd")
                if not create_secret(client, path=f"{mount}/{name}",mount_point=engine, secret_value=pwd):
                    return False
                secrets[secret_name] = pwd
            elif "pwd_urlsafe" == secret_type:
                pwd = generate_pwd(client,"pwd_urlsafe")
                if not create_secret(client, path=f"{mount}/{name}",mount_point=engine, secret_value=pwd):
                    return False
                secrets[secret_name] = pwd
            elif "key" == secret_type:
                if not generate_key(client, secret_name):
                    return False
                strong_key = generate_strong_key(client, secret_name)
                if not strong_key:
                    return False
                secrets[secret_name] = strong_key
                if not create_secret(client, path=f"{mount}/{name}",mount_point=engine, secret_value=strong_key):
                    return False
            else :
                pass
        
        if "env" == self.output :
            with open(output_path+".env","w") as f:
                for secret_name, secret in secrets.items():
                    f.write(f"{secret_name}={secret}\n")
            logger.info(f"saved secrets at {output_path}")
            
        elif self.dev and "json" == self.output :
            with open(output_path+".json","w") as f:
                f.write(json.dumps(secrets,indent=4))
            logger.info(f"saved secrets at {output_path}")

        return True


@dataclass
class Read(Cmd):
    dev : bool
    output : str

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('read', help="read secret from the vault")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.add_argument('-o','--output',dest="output", choices=["json","env"],default="env", help="output of the generated secrets")
        parser.set_defaults(func=lambda args : Read(
            dev=args.dev,
            output=args.output,
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Reading secrets from vault ...")

        url = cfg.get("vault",{}).get("url","http://127.0.0.1:8200")
        output_path = cfg.get("vault",{}).get("output_path","secrets")
        initialization_tokens_path = cfg.get("vault",{}).get("initialization_tokens_path",os.path.join(vault_dir,"root_tokens.json"))

        logger.debug(initialization_tokens_path)
        secrets_cfg = cfg.get("vault",{}).get("secrets", {})

        with open(initialization_tokens_path,"r") as f:
            root_tokens = json.load(f)

        client = hvac.Client(
            url=url,
            token=root_tokens["root_token"]
        )
        if not client.is_authenticated():
            logger.error("vault authentication failed")
            return
        
        secrets = {}

        for secret_name, secret_cfg in secrets_cfg.items() :
            secret_type =  secret_cfg.get("type","pwd").lower()
            engine =  secret_cfg.get("engine").lower()
            name =  secret_cfg.get("name").lower()
            mount =  secret_cfg.get("mount").lower()
            try:
                # Read secret from vault
                secret_path = f"{mount}/{name}"
                response = client.secrets.kv.v2.read_secret_version(
                    path=secret_path,
                    mount_point=engine
                )
                
                if "data" in response and "data" in response["data"] and "value" in response["data"]["data"]:
                    secret_value = response["data"]["data"]["value"]
                    secrets[secret_name] = secret_value
                    logger.info(f"Secret '{secret_name}' read successfully from path '{engine}/{secret_path}'")
                else:
                    logger.warning(f"Secret '{secret_name}' not found or has unexpected format at path '{engine}/{secret_path}'")
            except Exception as e:
                logger.error(f"Error reading secret '{secret_name}': {str(e)}")
                # Continue with other secrets even if one fails
        print(secrets)
        if "env" == self.output :
            with open(output_path+".env","w") as f:
                for secret_name, secret in secrets.items():
                    f.write(f"{secret_name}={secret}\n")
            logger.info(f"saved secrets at {output_path}")
            
        elif self.dev and "json" == self.output :
            with open(output_path+".json","w") as f:
                f.write(json.dumps(secrets,indent=4))
            logger.info(f"saved secrets at {output_path}")

        return True

@dataclass
class Init(Cmd):
    dev : bool

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('init', help="Initialize the vault")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.set_defaults(func=lambda args : Init(
            dev=args.dev
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Initalizing the vault ...")
        
        container_name = cfg.get("vault",{}).get("container_name","vault")
        password_policy_path = cfg.get("vault",{}).get("password_policy_path",os.path.join(vault_dir,"password-policy.hcl"))
        password_urlsafe_policy_path = cfg.get("vault",{}).get("password_urlsafe_policy_path",os.path.join(vault_dir,"password-urlsafe-policy.hcl"))
        url = cfg.get("vault",{}).get("url","http://127.0.0.1:8200")
        initialization_tokens_path = cfg.get("vault",{}).get("initialization_tokens_path",os.path.join(vault_dir,"root_tokens.json"))
        engines_cfg = cfg.get("vault",{}).get("engines",{})

        cmd = f"docker exec {container_name} vault operator init -format=json"
        logger.debug(f"init with cmd : {cmd}")
        try:
            result = subprocess.run(shlex.split(cmd), capture_output=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"cmd stderr :\n{e.stderr}")
            return False
        if result.stdout is None:
            logger.error("cmd stdout is empty")
            return None
        
        data = json.loads(result.stdout.strip())
        if "unseal_keys_b64" not in data:
            logger.error("unseal_keys_b64 not present")
            return None 
        keys = data['unseal_keys_b64']
        if 'root_token' not in data:
            logger.error("root_token not present")
            return None

        root_token : str = data['root_token']
        unseal_keys : List[UnsealedKey] = []
        for key in keys:
            cmd = f"docker exec {container_name} vault operator unseal {key}"
            logger.debug(f"unsealing with cmd : {cmd.replace(key,'*secret*')}")
            try :
                result = subprocess.run(shlex.split(cmd), capture_output=True, text=True, check=True)
            except subprocess.CalledProcessError as e:
                logger.error(f"cmd stderr :\n{e.stderr}")
                return False
            result = result.stdout.strip()
            unseal_key = UnsealedKey.extract(key,result.split('\n'))
            if unseal_key is None:
                logger.error("unseal_key invalid")
                return False
            unseal_keys.append(unseal_key)
        
        # SAVE root tokens
        @dataclass
        class VaultInitializationTokens:
            unseal_keys : List[UnsealedKey]
            root_token : str

        with open(initialization_tokens_path,"w") as f:
            f.write(
                json.dumps(
                    dataclasses.asdict(
                        VaultInitializationTokens(
                            unseal_keys=unseal_keys,
                            root_token=root_token
                            )
                        ),
                    indent=4
                )
            )

        # INIT Default engine
        client = hvac.Client(
            url=url,
            token=root_token
        )
        if not client.is_authenticated():
            logger.error("vault authentication failed")
            return
        
        # Create Password policy
        if not os.path.isfile(password_policy_path):
            print(f"{password_policy_path} does not exist")
            return
        
        if not create_password_policy(client,"pwd",password_policy_path):
            return
        
        # Create Password Url Safe policy
        if not os.path.isfile(password_urlsafe_policy_path):
            print(f"{password_urlsafe_policy_path} does not exist")
            return
        
        if not create_password_policy(client,"pwd_urlsafe",password_urlsafe_policy_path):
            return

        for engine_name, engine_cfg in engines_cfg.items():
            if not create_kv_engine(
                client=client, 
                path=engine_cfg.get("path",engine_name),
                backend_type=engine_cfg.get("backend_type","kv"),
                options=engine_cfg.get("options",{'version': '2'})):
                return False
            logger.info(f"successfully configured {engine_name} engine")


        # Enable transit engine
        response : requests.Response = client.sys.enable_secrets_engine(backend_type='transit')
        if response.ok:
            logger.info("Transit engine enabled successfully.")
        else :
            logger.error("Transit engine enabling failed")
            return False
        
        return True

@dataclass
class Arg:

    @staticmethod
    def parse() -> Tuple[str, str, 'Cmd']:
        parser = argparse.ArgumentParser(description='Vault Management CLI')
        parser.add_argument('--config', default=os.path.join(vault_dir,"config.toml"), dest="config")
        subparsers = parser.add_subparsers(dest='command', required=True)
        
        Seal.parse(subparsers)
        Unseal.parse(subparsers)
        Gen.parse(subparsers)
        Read.parse(subparsers)
        Init.parse(subparsers)

        args = parser.parse_args()
        command_args = args.func(args)
        return args.command, args.config, command_args

def main():
    name, cfg_path, cmd = Arg.parse()
    cfg = Config.parse(cfg_path)
    
    try :
        res = cmd.run(cfg)
        return res
    except Exception as e:
        logger.error(f"execution of {name}: {repr(e)}")
        print(traceback.format_exc())
        return False
    
if __name__ == '__main__':
    import time
    logger.info("Starting vault setup ...")
    starting_time = time.time()
    res = main()
    end_time = time.time()
    execution_time = end_time - starting_time
    if res:
        logger.info(f"successful vault setup ({execution_time:.2f}ms)")
    else :
        logger.error(f"failed vault setup({execution_time:.2f}ms)")