from abc import ABC, abstractmethod
import argparse
from dataclasses import dataclass
import logging
import os
from pathlib import Path
import traceback
from typing import Dict, Tuple
import redis
import toml

def setup_logger(name: str = "portrai_cache_setup", log_file: str | Path | None = None) -> logging.Logger:
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

cache_dir = os.path.dirname(__file__)
logger = setup_logger(log_file=os.path.join(cache_dir, "cache_setup.log"))

def create_user(host='localhost', port=6379, admin_password=None, username=None, password=None):
    # Connect to Dragonfly with admin privileges
    r = redis.Redis(host=host, port=port, password=admin_password, decode_responses=True)

    try:
        # Create a new user with the given username and password
        acl_command = f"ACL SETUSER {username} on >{password} ~* +@all +@pubsub allchannels"
        result = r.execute_command(acl_command)
        if result.strip() == 'OK':
            logger.info(f"User '{username}' created successfully.")
        else:
            logger.error(f"Failed to create user '{username}'.")
            return False

        # Save the ACL configuration to make it persistent
        r.execute_command("ACL SAVE")
    except redis.exceptions.ResponseError as e:
        logger.error(f"creating user: {e}")
        return False
    finally:
        r.close()
    return True

class Config:
    @staticmethod
    def parse(path:str) -> Dict[str,Dict[str,any]]:        
        if not os.path.exists(path):
            return {}
        with open(path, 'r') as file:
            data = toml.load(file)
        return data


class Cmd(ABC):
    @abstractmethod
    def run(self, cfg:dict) -> bool:
        """This method must be implemented by all classes that implement Cmd"""
        return False
    
@dataclass
class User(Cmd):
    dev : bool
    username : str
    password : str
    root_pwd : str

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('create_user', help="Initialize the cache")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.add_argument('-r','--root', help="root password")
        parser.add_argument('-u','--user', help="username")
        parser.add_argument('-p','--password', help="password")
        parser.set_defaults(func=lambda args : Init(
            dev=args.dev,
            username=args.user,
            password=args.password,
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Initalizing the cache ...")
        host = cfg.get("cache",{}).get("host","localhost")
        port = cfg.get("cache",{}).get("port",6379)

        if not create_user(host=host,
                    port=port,
                    admin_password=self.root_pwd,
                    username=self.username,
                    password=self.password):
            return False
        return True  
        
@dataclass
class Init(Cmd):
    dev : bool
    root_pwd : str

    @staticmethod
    def parse(subparser:argparse._SubParsersAction):
        parser = subparser.add_parser('init', help="Initialize the cache")
        parser.add_argument('--dev', action='store_true', help="Set dev mode")
        parser.add_argument('-r','--root', help="root password")
        parser.set_defaults(func=lambda args : Init(
            dev=args.dev,
            root_pwd=args.root,
        ))

    def run(self, cfg:Dict[str,Dict[str,any]]) :
        logger.info("Initalizing the cache ...")
        host = cfg.get("cache",{}).get("host","localhost")
        port = cfg.get("cache",{}).get("port",6379)

        client = redis.Redis(host=host, port=port)
        
        try : 
            if not client.config_set('requirepass', self.root_pwd):
                logger.error("Failed to set up the cache root password")
                return False
        except Exception as e:
            logger.error(f"failed to set root password, error = {repr(e)}")
            return False
        client.close()
        return True
        
@dataclass
class Arg:

    @staticmethod
    def parse() -> Tuple[str, str, 'Cmd']:
        parser = argparse.ArgumentParser(description='Cache Management CLI')
        parser.add_argument('--config', default=os.path.join(cache_dir, "config.toml"), dest="config")
        subparsers = parser.add_subparsers(dest='command', required=True)
        
        Init.parse(subparsers)
        User.parse(subparsers)

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
    logger.info("Starting cache setup ...")
    starting_time = time.time()
    res = main()
    end_time = time.time()
    execution_time = end_time - starting_time
    if res:
        logger.info(f"successful cache setup ({execution_time:.2f}ms)")
    else :
        logger.error(f"failed cache setup({execution_time:.2f}ms)")