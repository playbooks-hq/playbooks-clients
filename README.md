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
The Playbooks CLI gives developers quick & easy terminal access to their Playbooks account so they can browse, purchase, download, and clone repositories on the go. Using the CLI, developers can also toggle in and out of their team accounts where they can perform similar actions. After installation, developers can use the `playbooks` prompt followed by various commands making it easy to access your Playbooks content from anywhere Node is available (ie your computer, remote server, containers, etc).


## Config File
Playbooks will look for (or create) a config file at the root of your file system `~/.playbooksrc` containing your platform secrets. Please keep it safe and keep it secret. As an alternative, you can provide a custom config file location per command using `--config ~/path/to/.playbooksrc`. The config file follows a standard `.env` file format like so:

```
id=1
name=Eric Hubbell
uuid=eric-hubbell
email=eric@playbooks.xyz
token=********
account=eric-hubbell
accountType=User
```

## Commands


### Account
Display which account is currently active.

```bash
playbooks account
playbooks account --select 'id,name,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of account fields you'd like to display |


### Clone
Clone a Playbooks repo to your Github account.

```bash
playbooks clone <repo_uuid>
playbooks clone <repo_uuid> --account playbooks-community --name my-new-repo
```

| Option | Type | Description |
| --- | --- | --- |
| --account | string | Clone to a specific account |
| --name | string | Rename the cloned repository |
| --private | boolean | Mark the cloned repository as private |


### Config
Display your config file.

```bash
playbooks config
playbooks config --select 'id,name,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


### Download
Download a Playbooks repo to your local computer.

```bash
playbooks download <repo_uuid>
playbooks download <repo_uuid> --unzip --remove
```

| Option | Type | Description |
| --- | --- | --- |
| --path | string | Path to custom destination folder |
| --unzip | boolean | Automatically unzip the binary file |
| --remove | boolean | Automatically remove the binary file |


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


### Logout
Logout of your Playbooks account.

```bash
playbooks logout
```

### Orders
View your account orders.

```bash
playbooks orders
playbooks orders --select 'id,amount,createdAt'
```

| Option | Type | Description |
| --- | --- | --- |
| --entity | enum | Filter by entityType |
| --select | string[] | A comma separated list of fields you'd like to display


### Repo
Fetch a specific repo

```bash
playbooks repo <uuid>
playbooks repo <uuid> --select 'id,name,uuid,tagline'
```

| Option | Type | Description |
| --- | --- | --- |
| --include | string | A comma separated list of relationships to include |
| --select | string[] | A comma separated list of fields you'd like to display


### Repos
Fetch a list of repos

```bash
playbooks repos
playbooks repos --select 'id,name,uuid,tagline'
playbooks repos --framework 'react'
playbooks repos --language 'typescript'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display
| --framework | string | Fetch by framework identifier |
| --language | string | Fetch by language identifier |
| --platform | string | Fetch by platform identifier |
| --tool | string | Fetch by tool identifier |
| --topic | string | Fetch by topic identifier |
| --view | enum | Fetch by view |


### Session
View your current session

```bash
playbooks session
playbooks session --select 'id,name,uuid,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


### Subscription
View your account subscription

```bash
playbooks subscription
playbooks subscription --select 'id,name,uuid,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


### Teams
View a list of your session teams

```bash
playbooks teams
playbooks teams --select 'id,name,uuid,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


### Toggle
Toggle your active account.

```bash
playbooks toggle
playbooks toggle --uuid 'playbooks-community'
```

| Option | Type | Description |
| --- | --- | --- |
| --uuid | string | Account identifier


## Questions
Please reach out to support@playbooks.xyz with any technical questions and / or issues.


## Author
- Playbooks XYZ
- support@playbooks.xyz


## Contributions
Please open a Github Issue describing the PR you want to submit before starting work.