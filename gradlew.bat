@echo off
setlocal
set DIRNAME=%~dp0
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
if not "%JAVA_HOME%" == "" goto findJavaFromJavaHome
set JAVA_EXE=java
goto findJava

:findJavaFromJavaHome
set JAVA_EXE=%JAVA_HOME%\bin\java.exe

:findJava
if exist "%JAVA_EXE%" goto execute
echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
exit /b 1

:execute
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% -classpath "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
