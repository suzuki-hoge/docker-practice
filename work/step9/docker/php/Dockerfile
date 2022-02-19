FROM ubuntu:latest

ENV TZ Asia/Tokyo

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
RUN apt-get update
RUN apt-get install -y php8.0 php8.0-mysql

#COPY ./docker/php/mail.ini /etc/php/8.0/cli/conf.d/mail.ini

RUN apt-get install -yqq msmtp msmtp-mta

COPY ./docker/php/mailrc /etc/msmtprc

