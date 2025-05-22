#!/usr/bin/env sh
################################################################################
##
##  Gradle start up script for UN*X
##
################################################################################

# 여기에 기본 JVM 옵션을 추가할 수 있습니다.
DEFAULT_JVM_OPTS=""

APP_NAME="Gradle"
# Wrapper jar 위치
ROOT_DIR=$(dirname "$0")/gradle/wrapper
CLASSPATH=$ROOT_DIR/gradle-wrapper.jar

# JAVA_HOME 설정 확인
if [ -n "$JAVA_HOME" ] ; then
  if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
    JAVACMD="$JAVA_HOME/jre/sh/java"
  else
    JAVACMD="$JAVA_HOME/bin/java"
  fi
else
  JAVACMD="java"
fi

exec "$JAVACMD" $DEFAULT_JVM_OPTS -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
