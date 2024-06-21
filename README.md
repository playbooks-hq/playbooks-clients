## Overview
A simple CLI to access the [Playbooks](https://www.playbooks.xyz) platform.


&ensp;
## Prerequisites
- Node
- A Playbooks account


&ensp;
## Quick Start
```
npm install -g @playbooks-xyz/playbooks-cli
playbooks login
playbooks download <repo_uuid>
```

&ensp;
## Description
The Playbooks CLI gives developers quick & easy terminal access to their Playbooks account so they can browse, purchase, download, and clone repositories from anywhere. Using the CLI, developers can also toggle in and out of their associated accounts making it a breeze to perform similar actions on behalf of those entities. After installation, simply use the `playbooks` prompt followed by the commands outlined below.

&ensp;
## Configuration
Playbooks will look for (or create) a config file at the root of your file system `~/.playbooksrc` containing your platform secrets. Keep it safe, keep it secret. As an alternative, you can provide a custom config file location using `--config ~/path/to/.playbooksrc` as part of any command. The config file format is similar to a `.env` file like so:

```
# Playbooks config file

id=1
name=Eric Hubbell
uuid=eric-hubbell
email=eric@playbooks.xyz
token=********
...
```

&ensp;
## Table of Contents
- [global](#global)
- [account](#account)
- [clone](#clone)
- [config](#config)
- [download](#download)
- [login](#login)
- [logout](#logout)
- [orders](#orders)
- [ping](#ping)
- [repo](#repo)
- [repos](#repos)
- [session](#session)
- [subscription](#subscription)
- [teams](#teams)
- [toggle](#toggle)


&ensp;
## Global
A list of global commands and options.

```bash
playbooks --help
playbooks --version

playbooks login --help
playbooks login --config ~/path/to/.playbooksrc

playbooks download --help
playbooks download --config ~/path/to/.playbooksrc
```

| Option | Type | Description |
| --- | --- | --- |
| --config | string | Path to a custom playbooks config file
| --help | boolean | Display info, examples, and a list of available options per command |
| --version | boolean | Display current library version |


&ensp;
## Commands
A list of Playbooks specific commands.


&ensp;
----
#### Account
Display which account is currently active.

```bash
playbooks account
playbooks account --select 'id,name,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of account fields you'd like to display |


&ensp;
----
#### Clone
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


&ensp;
----
#### Config
Display your config file.

```bash
playbooks config
playbooks config --select 'id,name,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
----
#### Download
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


&ensp;
----
#### Login
Login to your Playbooks account from the command line.

```bash
playbooks login
playbooks login --email acme@example.com --password ******
```

| Option | Type | Description |
| --- | --- | --- |
| --email | string | Your email address |
| --password | string | Your password |


&ensp;
----
#### Logout
Logout of your Playbooks account.

```bash
playbooks logout
```

&ensp;
----
#### Orders
View your account orders.

```bash
playbooks orders
playbooks orders --select 'id,amount,createdAt'
```

| Option | Type | Description |
| --- | --- | --- |
| --entity | enum | Filter by entityType |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
----
#### Repo
Fetch a specific repo

```bash
playbooks repo <uuid>
playbooks repo <uuid> --select 'id,name,uuid,tagline'
```

| Option | Type | Description |
| --- | --- | --- |
| --include | string | A comma separated list of relationships to include |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
----
#### Repos
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


&ensp;
----
#### Session
View your current session

```bash
playbooks session
playbooks session --select 'id,name,uuid,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
----
#### Subscription
View your account subscription

```bash
playbooks subscription
playbooks subscription --select 'id,name,uuid,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
----
#### Teams
View a list of your session teams

```bash
playbooks teams
playbooks teams --select 'id,name,uuid,email'
```

| Option | Type | Description |
| --- | --- | --- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
----
#### Toggle
Toggle your active account.

```bash
playbooks toggle
playbooks toggle --uuid 'playbooks-community'
```

| Option | Type | Description |
| --- | --- | --- |
| --uuid | string | Account identifier


&ensp;
## Questions
Please reach out to support@playbooks.xyz with any technical questions and / or issues.


&ensp;
## Author
- Playbooks XYZ
- support@playbooks.xyz


&ensp;
## Contributions
Please open a Github Issue describing the PR you want to submit before starting work.