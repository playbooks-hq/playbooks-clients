## Overview

The Playbooks CLI gives developers terminal access to their [Playbooks](https://www.playbooks.xyz) account.
Using the CLI, developers can browse, download, clone, and manage their plays from anywhere.
After installation, simply use the `playbooks` prompt followed by the commands outlined below.

## Prerequisites

- node
- npm

## Installation

```
npm install @playbooks/cli -g
```

## Quick Start

```
playbooks login
playbooks download <uuid>
```

## Configuration

The Playbooks CLI will look for the following config file `~/.playbooksrc` containing your platform secrets.
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

## Table of Contents

- [global](#global)
- [account](#account)
- [account banks](#account-banks)
- [account bookmarks](#account-bookmarks)
- [account cards](#account-cards)
- [account charges](#account-charges)
- [account collections](#account-collections)
- [account drafts](#account-drafts)
- [account downloads](#account-downloads)
- [account ledger](#account-ledger)
- [account payouts](#account-payouts)
- [account plays](#account-plays)
- [account subscription](#account-subscription)
- [account teams](#account-teams)
- [account transfers](#account-transfers)
- [account usage](#account-usage)
- [add](#add)
- [clone](#clone)
- [collections](#collections)
- [config](#config)
- [download](#download)
- [frameworks](#frameworks)
- [init](#init)
- [languages](#languages)
- [login](#login)
- [logout](#logout)
- [mcp](#mcp)
- [oauth](#oauth)
- [ping](#ping)
- [plays](#plays)
- [platforms](#platforms)
- [publish](#publish)
- [session](#session)
- [submit](#submit)
- [sync](#sync)
- [tags](#tags)
- [teams](#teams)
- [tools](#tools)
- [toggle](#toggle)
- [users](#users)

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

| Option    | Type    | Description                                |
| :-------- | :------ | :----------------------------------------- |
| --config  | string  | Path to a custom playbooks config file     |
| --help    | boolean | Display command info and available options |
| --version | boolean | Display current library version            |

## Commands

A list of Playbooks specific commands.

#### Account

Display which account is currently active.

```sh
playbooks account
playbooks account --select 'id,name,email'
```

| Option   | Type     | Description                                                    |
| :------- | :------- | :------------------------------------------------------------- |
| --select | string[] | A comma separated list of account fields you'd like to display |

#### Account Banks

View your account banks.

```sh
playbooks account banks
playbooks account banks --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Bookmarks

View your account bookmarks.

```sh
playbooks account bookmarks
playbooks account bookmarks --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Cards

View your account cards.

```sh
playbooks account cards
playbooks account cards --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Charges

View your account charges.

```sh
playbooks account charges
playbooks account charges --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Collections

View your account collections.

```sh
playbooks account collections
playbooks account collections --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Drafts

View your account drafts.

```sh
playbooks account drafts
playbooks account drafts --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Downloads

View your account downloads.

```sh
playbooks account downloads
playbooks account downloads --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Ledger

Fetch and display your account ledger statistics.

```sh
playbooks account ledger
playbooks account ledger --select 'creditsEarned,creditsSpent,balance'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Account Payouts

View your account payouts.

```sh
playbooks account payouts
playbooks account payouts --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Plays

View your account plays.

```sh
playbooks account plays
playbooks account plays --status draft --page 1
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --status    | string   | Filter by status                                       |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Subscription

Fetch and display your account subscription

```sh
playbooks account subscription
playbooks account subscription --select 'id,name,uuid,email'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Account Teams

View a list of your account teams

```sh
playbooks account teams
playbooks account teams --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

**_Please note: this command is only available when a user account is activated._**

#### Account Transfers

View your account transfers.

```sh
playbooks account transfers
playbooks account transfers --page 2 --pageSize 25
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Account Usage

Fetch and display your account usage statistics.

```sh
playbooks account usage
playbooks account usage --select 'id,totalCredits,totalRemaining'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Add

Add a play to your local project and run install commands.

```sh
playbooks add <uuid>
playbooks add <uuid> --path ~/path/to/folder
```

| Option    | Type   | Description                       |
| :-------- | :----- | :-------------------------------- |
| --path    | string | Path to custom destination folder |
| --name    | string | Custom name for the directory     |
| --version | string | Specify a specific version to add |

#### Clone

Clone a play to your Github account.

```sh
playbooks clone <uuid>
playbooks clone <uuid> --account mile-hi-labs --private
```

| Option    | Type    | Description                     |
| :-------- | :------ | :------------------------------ |
| --account | string  | Clone to a specific account     |
| --name    | string  | Rename the cloned play          |
| --private | boolean | Mark the cloned play as private |
| --version | string  | Specify the versionId           |

#### Collections

Fetch collection related resources.

```sh
playbooks collections
playbooks collections starter-packs
playbooks collections starter-packs --include team
playbooks collections starter-packs plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Config

Display your config file.

```sh
playbooks config
playbooks config --select 'token,uuid'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Download

Download a play to your local machine.

```sh
playbooks download <uuid>
playbooks download <uuid> --path ~/path/to/folder
```

| Option    | Type   | Description                            |
| :-------- | :----- | :------------------------------------- |
| --path    | string | Path to custom destination folder      |
| --name    | string | Custom name for the directory          |
| --version | string | Specify a specific version to download |

#### Frameworks

Fetch framework related resources.

```sh
playbooks frameworks
playbooks frameworks react
playbooks frameworks react --include team
playbooks frameworks react plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Init

Add a playbooks.json file to your project.

```sh
playbooks init
playbooks init --path ~/path/to/project
```

| Option | Type   | Description                       |
| :----- | :----- | :-------------------------------- |
| --path | string | Path to custom destination folder |

#### Languages

Fetch language related resources.

```sh
playbooks languages
playbooks languages typescript
playbooks languages typescript --include framework
playbooks languages typescript plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Login

Login to your Playbooks account via email / password.

```sh
playbooks login
playbooks login --email acme@example.com --password ******
```

| Option     | Type   | Description        |
| :--------- | :----- | :----------------- |
| --email    | string | Your email address |
| --password | string | Your password      |

#### Logout

Logout of your Playbooks account.

```sh
playbooks logout
```

#### MCP

Configure Playbooks MCP for supported coding environments on your local machine.

```sh
playbooks mcp claude
playbooks mcp codex
playbooks mcp cursor
playbooks mcp vscode
```

#### Oauth

Login to Playbooks via Github OAuth.

```sh
playbooks oauth
```

#### Ping

Test your connection to the Playbooks API.

```sh
playbooks ping
```

#### Plays

Fetch play related resources.

```sh
playbooks plays
playbooks plays actix-official-starter
playbooks plays actix-official-starter demo
playbooks plays actix-official-starter deploy
playbooks plays --framework react
playbooks plays --language typescript
playbooks plays --team mile-hi-labs
playbooks plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --framework | string   | Fetch by framework identifier                          |
| --language  | string   | Fetch by language identifier                           |
| --platform  | string   | Fetch by platform identifier                           |
| --team      | string   | Fetch by team identifier                               |
| --tool      | string   | Fetch by tool identifier                               |
| --tag       | string   | Fetch by tag identifier                                |
| --user      | string   | Fetch by user identifier                               |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Platforms

Fetch platform related resources.

```sh
playbooks platforms
playbooks platforms web
playbooks platforms web --include tool
playbooks platforms web plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Publish

Publish a play to the marketplace.

```sh
playbooks publish <uuid>
```

#### Session

Fetch and display your current session

```sh
playbooks session
playbooks session --select 'id,name,uuid,email'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Submit

Submit a play via Github URL.

```sh
playbooks submit https://github.com/ehubbell/astro-official-starter
playbooks submit https://github.com/ehubbell/astro-official-starter --variant default --visibility public
```

| Option       | Type   | Description       |
| :----------- | :----- | :---------------- |
| --variant    | string | Select variant    |
| --visibility | string | Select visibility |

#### Sync

Sync a play to pull the latest files from Github.

```sh
playbooks sync <uuid>
```

#### Tags

Fetch tag related resources.

```sh
playbooks tags
playbooks tags portfolio
playbooks tags portfolio --include user
playbooks tags portfolio plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Teams

Fetch team related resources.

```sh
playbooks teams
playbooks teams mile-hi-labs
playbooks teams mile-hi-labs --include users
playbooks teams mile-hi-labs plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Tools

Fetch tool related resources.

```sh
playbooks tools
playbooks tools stripe
playbooks tools stripe --include platform
playbooks tools stripe plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

#### Toggle

Toggle your active account.

```sh
playbooks toggle
playbooks toggle --uuid 'playbooks-community'
```

| Option | Type   | Description        |
| :----- | :----- | :----------------- |
| --uuid | string | Account identifier |

#### Users

Fetch user related resources.

```sh
playbooks users
playbooks users ehubbell
playbooks users ehubbell --include teams
playbooks users ehubbell plays --view featured
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --include   | string   | A comma separated list of relationships to include     |
| --view      | string   | Filter by view                                         |
| --page      | number   | Fetch a specific page                                  |
| --pageSize  | number   | Fetch a specific page size                             |
| --sortProp  | string   | Sort by a specific property                            |
| --sortValue | string   | Sort using a specific value                            |

## Questions

Please reach out to support@playbooks.xyz with any technical questions and / or issues.

## Author

- Playbooks XYZ
- support@playbooks.xyz

## Contributions

Please open a Github Issue describing the PR you want to submit before starting work.
