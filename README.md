## Overview
A simple CLI to access the Playbooks platform.


## Prerequisites
- Node
- Playbooks


## Quick Start
- `npm i -g @playbooks-xyz/playbooks-cli`
- `playbooks <repo_url>`
- `playbooks <repo_url> --directory ~/repos`


## Description
The commands above will install playbooks on your local machine and make the `playbooks` command globally available.


## Config
Playbooks will look for a `.playbooksrc` file at the root of your file system `~/.playbooksrc` containing your API credentials or you can supply a custom path per command.
Playbooks will then read the following variables from the `.playbooksrc` file using the indicated format:

```
PLAYBOOKS_EMAIL=acme@example.com
PLAYBOOKS_PASSWORD=******
PLAYBOOKS_TOKEN=******
```


## Author
- Playbooks XYZ
- support@playbooks.xyz


## Inspiration
- degit
- gittar


## Contributions
Please open an issue describing the PR you want to submit before starting work.