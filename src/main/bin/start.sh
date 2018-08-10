#!/bin/sh
JAVA_OPTS=""
PWD=`pwd`
for i in lib/*;
	do CLASSPATH=$PWD/$i:"$CLASSPATH";
done
export CLASSPATH=.:$CLASSPATH
java $JAVA_OPTS -Dfile.encoding=utf-8 -server -classpath config:Bargain.jar com.yukoon.bargain.BargainApplication


