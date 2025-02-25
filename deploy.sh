#!/bin/bash

scp html/* root@litlog.crabdance.com:/var/www/html/
scp jsapp/* root@litlog.crabdance.com:/var/www/jsapp/
ssh root@litlog.crabdance.com systemctl restart jsapp

