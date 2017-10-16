#!/bin/bash


lockdir=/trolleyman.org/.heartbeat-lock
mkdir $lockdir  || {
    echo "Lock directory exists"
    exit 1
}
# take pains to remove lock directory when script terminates
trap "rmdir $lockdir" EXIT INT KILL TERM

PATH=/bin:/usr/bin
THEDIR=/tmp/apache-watchdog
EMAIL=cgtrolley@gmail.com
mkdir -p $THEDIR

if wget --timeout=30 -q -O /dev/null http://localhost/heartbeat
then
    # we are up
    touch ~/.apache-was-up
else
    # down! but if it was down already, don't keep spamming
    if [[ -f ~/.apache-was-up ]]; then
        # write a nice e-mail
        echo -n "Apache crashed at " > $THEDIR/mail
        date >> $THEDIR/mail
        echo >> $THEDIR/mail
        echo "=====*** Access log ***=====" >> $THEDIR/mail
        tail -n 30 /var/log/apache2/access.log >> $THEDIR/mail
        echo >> $THEDIR/mail
        echo "=====*** Error log ***=====" >> $THEDIR/mail
        tail -n 30 /var/log/apache2/error.log >> $THEDIR/mail
        echo >> $THEDIR/mail
	echo "=====*** Django log ***======" >> $THEDIR/mail
	tail -n 30 /var/log/apache2/django.log >> $THEDIR/mail
	echo >> $THEDIR/mail
        # kick apache
        echo "Running update.sh ..." >> $THEDIR/mail
	
	{
		/trolleyman.org/update.sh
	} >> $THEDIR/mail 2>&1
	
        # send the mail
        echo >> $THEDIR/mail
        echo "Good luck troubleshooting!" >> $THEDIR/mail
        mail -s "trolleyman.org: Apache Crashed!" $EMAIL < $THEDIR/mail
        rm ~/.apache-was-up
    fi
fi

rm -rf $THEDIR
