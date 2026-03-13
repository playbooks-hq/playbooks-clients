## Overview

The Playbooks CLI gives developers terminal access to their [Playbooks](https://www.playbooks.xyz) account.
Using the CLI, developers can purchase, download, and clone plays from anywhere.
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
- [add](#add)
- [banks](#banks)
- [cards](#cards)
- [clone](#clone)
- [download](#download)
- [login](#login)
- [logout](#logout)
- [orders](#orders)
- [ping](#ping)
- [play](#play)
- [plays](#plays)
- [session](#session)
- [subscription](#subscription)
- [teams](#teams)
- [toggle](#toggle)
- [usage](#usage)

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

#### Banks

View your account banks.

```sh
playbooks banks
playbooks banks --select 'id,summary,createdAt'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Cards

View your account cards.

```sh
playbooks cards
playbooks cards --select 'id,summary,createdAt'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Clone

Clone a play to your Github account.

```sh
playbooks clone <uuid>
playbooks clone <uuid> --account playbooks-community --name my-cloned-play
```

| Option    | Type    | Description                     |
| :-------- | :------ | :------------------------------ |
| --account | string  | Clone to a specific account     |
| --name    | string  | Rename the cloned play          |
| --private | boolean | Mark the cloned play as private |
| --version | string  | Specify the versionId           |

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

#### Downloads

View your account downloads.

```sh
playbooks downloads
playbooks downloads --select 'id,amount,createdAt'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

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

#### Oauth

Login to Playbooks via Github OAuth.

```sh
playbooks oauth
```

#### Payouts

View your account payouts.

```sh
playbooks payouts
playbooks payouts --select 'id,amount,createdAt'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Ping

Test your connection to the Playbooks API.

```sh
playbooks ping
```

#### Play

Fetch a specific play

```sh
playbooks play <uuid>
playbooks play actix-official-starter --include framework
```

| Option    | Type     | Description                                            |
| :-------- | :------- | :----------------------------------------------------- |
| --include | string   | A comma separated list of relationships to include     |
| --select  | string[] | A comma separated list of fields you'd like to display |

#### Plays

Fetch a list of plays

```sh
playbooks plays
playbooks plays --select 'id,name,uuid,tagline'
playbooks plays --framework 'react'
playbooks plays --language 'typescript'
playbooks plays --team 'mile-hi-labs'
playbooks plays --view 'featured'
```

| Option      | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| --select    | string[] | A comma separated list of fields you'd like to display |
| --framework | string   | Fetch by framework identifier                          |
| --language  | string   | Fetch by language identifier                           |
| --platform  | string   | Fetch by platform identifier                           |
| --tool      | string   | Fetch by tool identifier                               |
| --tag       | string   | Fetch by tag identifier                                |
| --view      | enum     | Fetch by view                                          |

#### Session

Fetch and display your current session

```sh
playbooks session
playbooks session --select 'id,name,uuid,email'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Subscription

Fetch and display your account subscription

```sh
playbooks subscription
playbooks subscription --select 'id,name,uuid,email'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Teams

View a list of your session teams

```sh
playbooks teams
playbooks teams --select 'id,name,uuid,email'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

**_Please note: this command is only available when a user account is activated._**

#### Toggle

Toggle your active account.

```sh
playbooks toggle
playbooks toggle --uuid 'playbooks-community'
```

| Option | Type   | Description        |
| :----- | :----- | :----------------- |
| --uuid | string | Account identifier |

#### Transfers

View your account transfers.

```sh
playbooks transfers
playbooks transfers --select 'id,amount,createdAt'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

#### Usage

Fetch and display your account usage statistics

```sh
playbooks usage
playbooks usage --select 'id,totalCredits,totalRemaining'
```

| Option   | Type     | Description                                            |
| :------- | :------- | :----------------------------------------------------- |
| --select | string[] | A comma separated list of fields you'd like to display |

## Questions

Please reach out to support@playbooks.xyz with any technical questions and / or issues.

## Author

- Playbooks XYZ
- support@playbooks.xyz

## Contributions

Please open a Github Issue describing the PR you want to submit before starting work.
