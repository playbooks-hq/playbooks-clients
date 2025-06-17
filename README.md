## Overview
The Playbooks CLI gives developers terminal access to their [Playbooks](https://www.playbooks.xyz) account.
Using the CLI, developers can purchase, download, and clone Playbooks repositories from anywhere.
After installation, simply use the `playbooks` prompt followed by the commands outlined below.

&ensp;
## Installation
```
npm install -g @playbooks/cli
playbooks login
playbooks download <repo_uuid>
```

&ensp;
## Configuration
The Playbooks CLI will look for a config file at the root of your file system `~/.playbooksrc` containing your platform secrets.
If one does not exist, the Playbooks CLI will create one when you login.
As an alternative, you can provide a custom config file location using the `--config` flag as part of any command.
Here is a sample config file located at the default location on your file system:

```
# ~/.playbooksrc

id=1
name=Eric Hubbell
email=eric@playbooks.xyz
uuid=eric-hubbell
token=********
...
```

&ensp;
## Table of Contents
- [global](#global)
- [account](#account)
- [banks](#banks)
- [cards](#cards)
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

```sh
playbooks --help
playbooks --version

playbooks login --help
playbooks login --config ~/path/to/.playbooksrc

playbooks download --help
playbooks download --config ~/path/to/.playbooksrc
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --config | string | Path to a custom playbooks config file
| --help | boolean | Display command info and available options |
| --version | boolean | Display current library version |


&ensp;
## Commands
A list of Playbooks specific commands.


&ensp;
#### Account
Display which account is currently active.

```sh
playbooks account
playbooks account --select 'id,name,email'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of account fields you'd like to display |


&ensp;
#### Banks
View your account banks.

```sh
playbooks banks
playbooks banks --select 'id,summary,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Cards
View your account cards.

```sh
playbooks cards
playbooks cards --select 'id,summary,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Charges
View your account charges.

```sh
playbooks charges
playbooks charges --select 'id,amount,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Clone
Clone a Playbooks repo to your Github account.

```sh
playbooks clone <repo_uuid>
playbooks clone <repo_uuid> --account playbooks-community --name my-new-repo
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --account | string | Clone to a specific account |
| --name | string | Rename the cloned repository |
| --private | boolean | Mark the cloned repository as private |


&ensp;
#### Config
Display your config file.

```sh
playbooks config
playbooks config --select 'id,name,email'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Download
Download a Playbooks repo to your local computer.

```sh
playbooks download <repo_uuid>
playbooks download <repo_uuid> --unzip --remove
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --path | string | Path to custom destination folder |
| --name | string | Provide a custom name for the download |
| --version | string | Specify a specific version to download |


&ensp;
#### Downloads
View your account downloads.

```sh
playbooks downloads
playbooks downloads --select 'id,amount,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Login
Login to your Playbooks account from the command line.

```sh
playbooks login
playbooks login --email acme@example.com --password ******
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --email | string | Your email address |
| --password | string | Your password |


&ensp;
#### Logout
Logout of your Playbooks account.

```sh
playbooks logout
```

&ensp;
#### Orders
View your account orders.

```sh
playbooks orders
playbooks orders --select 'id,amount,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --entity | enum | Filter by entityType |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Payouts
View your account payouts.

```sh
playbooks payouts
playbooks payouts --select 'id,amount,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Ping
Test your connection to the Playbooks API.

```sh
playbooks ping
```

&ensp;
#### Repo
Fetch a specific repo

```sh
playbooks repo <uuid>
playbooks repo <uuid> --select 'id,name,uuid,tagline'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --include | string | A comma separated list of relationships to include |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Repos
Fetch a list of repos

```sh
playbooks repos
playbooks repos --select 'id,name,uuid,tagline'
playbooks repos --framework 'react'
playbooks repos --language 'typescript'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display
| --framework | string | Fetch by framework identifier |
| --language | string | Fetch by language identifier |
| --platform | string | Fetch by platform identifier |
| --tool | string | Fetch by tool identifier |
| --topic | string | Fetch by topic identifier |
| --view | enum | Fetch by view |


&ensp;
#### Session
Fetch and display your current session

```sh
playbooks session
playbooks session --select 'id,name,uuid,email'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Subscription
Fetch and display your account subscription

```sh
playbooks subscription
playbooks subscription --select 'id,name,uuid,email'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


&ensp;
#### Teams
View a list of your session teams

```sh
playbooks teams
playbooks teams --select 'id,name,uuid,email'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display

***Please note: this command is only available when a user account is activated.***

&ensp;
#### Toggle
Toggle your active account.

```sh
playbooks toggle
playbooks toggle --uuid 'playbooks-community'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --uuid | string | Account identifier


&ensp;
#### Transfers
View your account transfers.

```sh
playbooks transfers
playbooks transfers --select 'id,amount,createdAt'
```

| Option | Type | Description |
| :--- | :--- | :--- |
| --select | string[] | A comma separated list of fields you'd like to display


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