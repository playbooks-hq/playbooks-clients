#!/bin/bash

echo "Welcome to Playbooks"
printf "\n"
echo "-----"
printf "\n"

init() {
	wget "https://somewebsite/somerepo-folder/$tarFileName"
}


init $1 $2

# Docs
# https://dev.to/adiatma/build-a-simple-cli-with-bash-2d31
# https://medium.com/@brotandgames/build-a-custom-cli-with-bash-e3ce60cfb9a4
# https://linuxize.com/post/wget-command-examples/
