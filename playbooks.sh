#!/bin/bash

auth_arg='';
config_arg=''
find_arg=''
install_arg=''
welcome_arg=''


init() {
	welcome
}


auth() {
	read -p "Full Name: " full_name
	read -p "Email Address: " email_address
	read -p "Password: " password
	echo "Thank you, ${full_name}!"
}


config() {
	read -p "Full Name: " full_name
	read -p "Email Address: " email_address
	read -p "Password: " password
	echo "Thank you, ${full_name}!"
}


find() {
	echo "Finding playbook..."
	echo "-----"
	printf "\n"
}


install() {
	echo "Installing playbook..."
	echo "-----"
	printf "\n"
}


welcome() {
	echo "$welcome_arg"
	echo "Welcome to Playbooks"
	echo "-----"
	printf "\n"
}


setup() {
	if [ wget == 'wget command not found' ]; then
		echo wget
		wget repo path
	else
		echo 'wget not found. Please enter your password to install'
		sudo apt-get install wget
		# init
	fi
}


# Single / Long Line Options
while getopts "a:c:f:i:w:-:" option
do
  if [ "$option" = "-" ]; then  # long option: reformulate OPT and OPTARG
    option="${OPTARG%%=*}"      # extract long option name
    option="${OPTARG#$option}"  # extract long option argument (may be empty)
    option="${OPTARG#=}"      	# if long option argument, remove assigning `=`
  fi
  case "${option}" 
	in
    a | auth)
    	auth_arg=${OPTARG};
			auth;;
		c | config) 
			config_arg=${OPTARG};
			config;;
    f | find) 
				find_arg=${OPTARG};
				find;;
		init) 
			init_arg=${OPTARG};
			init;;
		i | install) 
			install_arg=${OPTARG};
			install;;
		w | welcome) 
			welcome_arg=${OPTARG};
			welcome;;
		??* ) echo 'illegal option';;
		? ) exit 2;;
  esac
done
shift $((OPTIND-1)) 


# Loops through all plain subcommands
for option in "$@"; do
	echo $option;
	# echo $@;
done


# Standard commands
if [ $1 == "welcome" ]; then
	echo "$1: $2";
fi


# Docs
# https://dev.to/adiatma/build-a-simple-cli-with-bash-2d31
# https://medium.com/@brotandgames/build-a-custom-cli-with-bash-e3ce60cfb9a4
# https://linuxize.com/post/wget-command-examples/
# https://www.baeldung.com/linux/use-command-line-arguments-in-bash-script
# https://www.lifewire.com/pass-arguments-to-bash-script-2200571
