## Overview
A simple CLI to access the Playbooks platform.


## Prerequisites
- Node
- Playbooks


## Quick Start
- `npm i -g @playbooks-xyz/playbooks-cli`
- `playbooks download <repo_url>`
- `playbooks download <repo_url> --path ~/repos --unzip --remove`


## Description
Lorem ipsum...


## Config
Playbooks will look for a `.playbooksrc` file at the root of your file system `~/.playbooksrc` containing your API credentials or you can supply a custom path per command.
Playbooks will then read the following variables from the `.playbooksrc` file using the indicated format:

```
PLAYBOOKS_EMAIL=acme@example.com
PLAYBOOKS_PASSWORD=******
PLAYBOOKS_TOKEN=******
```

## Commands


### Account
Check which account is currently active.

```bash
playbooks login
playbooks login --email acme@example.com --password ******
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of account fields you'd like to display |


### Clone
Clone a Playbooks repo to your Github account.

```bash
playbooks clone <repo_url>
playbooks clone <repo_url> --account playbooks-community --name my-new-repo
```

| Option | Type | Description |
| --- | --- | --- |
| --account | string | Clone to a specific account's Github |
| --name | string | Rename the cloned repository |
| --private | string | Mark the cloned repository as private |


### Config
Display your current config file

```bash
playbooks config
```

### Login
Login to your Playbooks account from the command line.

```bash
playbooks login
playbooks login --email acme@example.com --password ******
```

| Option | Type | Description |
| --- | --- | --- |
| --email | string | Your email address |
| --password | string | Your password |




### Account
Check

```sh
playbooks login
playbooks login --email acme@example.com --password ******
```

| Option | Type | Description |
| --- | --- | --- |
| --email | string | Your email address |
| --password | string | Your password |



## Author
- Playbooks XYZ
- support@playbooks.xyz


## Inspiration
- degit
- gittar


## Contributions
Please open an issue describing the PR you want to submit before starting work.