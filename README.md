# TeradyneMobile
Code Related to the Teradyne Mobile App

For using the Remote Control feature, the following setup is required:

1. Download and unzip RemoteControl/RemoteControl.zip to a known location, *installDir*.
2. Import this VBA module *installDir*\RemoteControl.bas into your IGXL workbook.
3. In that module, modify XMLControlDir to be set to *installDir*\RemoteControl\UniServer\www\

When you want to use the Remote Control Feature, you need to start the web server by doing this:

1. Execute *installDir*/UniServer/Start_as_program.exe
2. Once, that launches, click to start the Apache Server.

Lastly, in IGXL, you have run the PollForCommand() VBA Sub Routine in the RemoteControl module.

Now you can connect from the Teradyne Mobile App or from any computer that can see the running web server by using the tester computer's IP address.

File any issues you are having with this here: https://github.com/teradyneinc/TeradyneMobile/issues
