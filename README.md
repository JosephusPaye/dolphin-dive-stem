# README #

This a repository for the Dolphin Dive STEM game we're working on. This Readme contains details on how to get the code and setup a development environment.

## Background and Development Requirements

### [Gulp](http://gulpjs.com/)

We are using a Gulp build system as it allows for:

* watching and automatically building the source files,
* managing and combining 3rd party (eg. Phaser, etc) CSS and JS files
* running an HTTP server for serving static game files
* automatically reloading the browser when changes are made to the source

### [Bower](http://bower.io/)

We also use Bower, a package manager for managing and installing our 3rd party front-end dependencies including Phaser.

### [NodeJS and NPM](http://nodejs.org/)

Both Bower and Gulp are NodeJS modules that are run from the command line. To use them, you need to have NodeJS and npm installed.

NPM is NodeJS's package manager and it's what we use to install Gulp, Bower and other dependencies like BrowserSync, which does the live reloading as we code. By default, it is installed with NodeJS

## Installing Development Tools

### Setup Proxy Variables (if working at school)

If working at school, make sure that proxy environment variables are set. You can copy and paste the following into a terminal to setup the proxy. However, this only works in that terminal window and will be reset when the window is closed. See [this snippet](https://bitbucket.org/snippets/systemicanomaly/4p5z/bashrc-file-with-school-proxy-settings) for a more permanent solution.
        
export http_proxy="http://billy.boyd1:coolies12@proxy.det.nsw.edu.au:8080"
export HTTP_PROXY=$http_proxy
export https_proxy=$http_proxy
export HTTPS_PROXY=$http_proxy
export ftp_proxy=$ http_proxy
export FTP_PROXY=$http_proxy
export all_proxy=$http_proxy
export ALL_PROXY=$http_proxy

### Git (version control)

We use Git to host the project and manage changes as we work on different parts collaboratively. To get a copy of the code to work with, you need to use Git to `clone` this repo. 

1. Install Git: https://git-scm.com/downloads
2. Setup Git by downloading [this sample .gitconfig file](https://bitbucket.org/snippets/systemicanomaly/oR54/gitconfig-file-for-setting-up-git-download) and adding your details (email you use on Bitbucket): The following is a sample of the file. Save it as `.gitconfig` in your home folder (Mac/Linux) or in your User folder (Windows).
        
        [user]
        	email = j.doe@gmail.com
        	name = John Doe
        [push]
        	default = simple

3. `cd` into a folder where you normally save your code and following command to clone the repo (change <YOUR_BITBUCKET_USERNAME> to your username. This will create a folder called `dolphin-dive-stem` in the current directory with the code in it.
        
        git clone https://<YOUR_BITBUCKET_USERNAME>@bitbucket.org/systemicanomaly/dolphin-dive-stem.git

4. You will be prompted for a password. Enter your password and the repo should be downloaded onto your system.


### NodeJS and NPM

1. Install Node JS and NPM

* Windows and Mac: https://nodejs.org/download/
* Linux:
        
        # Download
        curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -

        # Then install with:
        sudo apt-get install -y nodejs

2. Restart your terminal and check to see Node and NPM are installed correctly:

* Run `node --version` and you should see something similar to `v0.12.7`
* Run `npm --version` and you should see something similar to `2.11.3`

## Gulp and Bower

With NodeJS and NPM installed, run the following commands from a terminal to install `gulp` and `bower`

* Windows and Mac: `npm install -g gulp bower`
* Linux: `sudo npm install -g gulp bower`

To check if Gulp and Bower were installed correctly:

* Run `gulp --version` and you should see something similar to `[19:27:06] CLI version 3.9.0`
* Run `bower --version` and you should see something similar to `1.4.2`

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact