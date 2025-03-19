# portrai
A resume and profile maker to help user find job with the help of AI

# Dev Build and Usage
## Secrets managements

To start the vault container :
```
docker compose --profile vault --file vault/docker-compose.vault.dev.yml up -d
```
Then init the vault with :
```
$(which python3) vault/vault_setup.py init --dev
```
this will create a root_tokens.json file in the vault directory, this file is needed for the subsequent commands but needs to be protected and hidden carefully !

Then generate the secrets :
```
$(which python3) vault/vault_setup.py gen --dev
```
this will create a secrets.env file with the secrets stored in the vault used for the next sections of the build process, this file is to be deleted once the process is over.

Then seal the vault :
```
$(which python3) vault/vault_setup.py seal --dev
```
to unseal the vault :
```
$(which python3) vault/vault_setup.py unseal --dev
```

## Services
To start the services containers (supabase, monitoring, cache):
```
docker compose --env-file .env --env-file secrets.env --profile services --file docker-compose.dev.yml up -d
```

## Cache setup
To create the cache root user : 
```
$(which python3) cache/cache_setup.py init --dev --root $THE_ROOT_PASSWORD
```

## Use the backend outside of docker
load the env variables :
use only when using the back or front end outside of docker
```
source .env
source secrets.env
```

Then start the server: ( in the backend directory | cd backend )
```
POSTGRES_HOST=localhost KONG_AUTH_HOST=localhost DRAGONFLY_ADDR=localhost  go run --tags=dev ./bin/main.go
```

## Use the backend in docker
```
docker compose --env-file .env --env-file secrets.env --profile backend --file docker-compose.dev.yml up -d --build
```


## Use the frontend outside of docker
load the env variables :
use only when using the back or front end outside of docker
```
export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
```
TODO : find a better way

Then start the server: ( in the frontend directory | cd frontend )
```
npm run dev
```

## Use the frontend in docker
```
docker compose --env-file .env --profile frontend --file docker-compose.dev.yml up -d --build
```

## Use the stripe cli
```
stripe listen --forward-to localhost:3000/api/v1/payment/webhook
```