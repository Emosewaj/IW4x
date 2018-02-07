Set objArgs = WScript.Arguments
messageText = objArgs(0)
Wscript.quit(MsgBox("This installer will now download and install the files you selected into the following folder:" & vbCrLf & vbCrLf & objArgs(0) & vbCrLf & vbCrLf & "If this folder is incorrect, move the installer files to the correct folder and try again, otherwise proceed.", 1, "Confirm location"))
