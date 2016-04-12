Attribute VB_Name = "RemoteControl"
Option Explicit

Private Const FILE_NOTIFY_CHANGE_ATTRIBUTES = &H4
Private Const FILE_NOTIFY_CHANGE_DIR_NAME = &H2
Private Const FILE_NOTIFY_CHANGE_FILE_NAME = &H1
Private Const FILE_NOTIFY_CHANGE_SIZE = &H8
Private Const FILE_NOTIFY_CHANGE_LAST_WRITE = &H10
Private Const FILE_NOTIFY_CHANGE_SECURITY = &H100
Private Const FILE_NOTIFY_CHANGE_ALL = &H4 Or &H2 Or &H1 Or &H8 Or &H10 Or &H100

Private Const WAIT_ABANDONED = &H80
Private Const WAIT_OBJECT_0 = &H0
Private Const WAIT_TIMEOUT = &H102
Private Const WAIT_FAILED = &HFFFFFFFF

Private Declare Function FindFirstChangeNotification Lib "kernel32" Alias "FindFirstChangeNotificationA" (ByVal lpPathName As String, ByVal bWatchSubtree As Long, ByVal dwNotifyFilter As Long) As Long
Private Declare Function FindCloseChangeNotification Lib "kernel32" (ByVal hChangeHandle As Long) As Long
Private Declare Function FindNextChangeNotification Lib "kernel32" (ByVal hChangeHandle As Long) As Long
Private Declare Function WaitForSingleObject Lib "kernel32" (ByVal hHandle As Long, ByVal dwMilliseconds As Long) As Long
Private Declare Function ResetEvent Lib "kernel32" (ByVal hEvent As Long) As Long
Public Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)

Private Const XMLControlDir = "C:\Users\champioc\Downloads\UniServer\UniServer\www\"
Private Const XMLResultDir = XMLControlDir
Private Const XMLControlFile = "start.xml"
Private Const XMLResultFile = "finish.xml"
  
Public Sub PollForCommand()
    Dim hHandle As Long
    Dim result As Long
    hHandle = FindFirstChangeNotification(XMLControlDir, &H0, FILE_NOTIFY_CHANGE_FILE_NAME)
    Do Until False
        DoEvents 'Calling DoEvents with a sleep call later allows us to not stall out the GUI
        result = WaitForSingleObject(hHandle, &H0)
        If (result = WAIT_OBJECT_0) Then
            Call ProcessXML
            FindNextChangeNotification (hHandle)
        End If
        Sleep 50
    Loop
End Sub


Public Sub ProcessXML()
    Dim strFile As String
    Dim procFile As String
    strFile = Dir(XMLControlDir & XMLControlFile, vbNormal)
    Do While Len(strFile) > 0
        procFile = XMLControlDir & strFile
        Call RunAndReport(procFile)
        strFile = Dir
        DeleteFile (procFile)
    Loop
End Sub

Function FileExists(ByVal FileToTest As String) As Boolean
   FileExists = (Dir(FileToTest) <> "")
End Function

Sub DeleteFile(ByVal FileToDelete As String)
   If FileExists(FileToDelete) Then
      SetAttr FileToDelete, vbNormal
      Kill FileToDelete
   End If
End Sub

Sub RunAndReport(ByVal procFile As String)

    Dim resultArray() As Long
    Dim binArray() As Long
    Dim sortArray() As Long
    Dim logicArray() As Long
    Dim savedResultArray() As Long
    Dim savedBinArray() As Long
    Dim savedSortArray() As Long
    Dim savedLogicArray() As Long
    Dim retestArray() As Long
    Dim TotalRun As Single
    ReDim resultArray(0)
    ReDim binArray(0)
    ReDim sortArray(0)
    ReDim logicArray(0)
    ReDim savedResultArray(0)
    ReDim savedBinArray(0)
    ReDim savedSortArray(0)
    ReDim savedLogicArray(0)
    ReDim retestArray(0)
    Dim count As Long
    Dim siteLoop As Long
    
    Dim resultTmpFile As String
    Dim resultFile As String
    Dim resultStr As String
    
    Dim XDoc As MSXML2.DOMDocument
    Dim nNodeList As MSXML2.IXMLDOMNodeList
    Dim nNode As MSXML2.IXMLDOMNode

    Set XDoc = New MSXML2.DOMDocument
    XDoc.async = False
    XDoc.validateOnParse = False
    XDoc.Load (procFile)
    
    Set nNodeList = XDoc.getElementsByTagName("command")
    For Each nNode In nNodeList
        If nNode.Text = "start" Then
            Call TheExec.RunTestProgram
            
            count = TheExec.Flow.SiteResult(resultArray(), binArray(), sortArray(), _
            logicArray(), savedResultArray(), savedBinArray(), savedSortArray(), _
            savedLogicArray(), retestArray(), TotalRun)
            
            resultFile = XMLResultDir & XMLResultFile
            resultTmpFile = XMLResultDir & XMLResultFile & ".tmp"
            resultStr = "<?xml version=""1.0"" encoding=""UTF-8""?>" + vbCrLf
            resultStr = resultStr + "<teradyne>" + vbCrLf
                
            For siteLoop = 0 To count - 1
                If (binArray(siteLoop) <> -1) Then
                    resultStr = resultStr + "<site>" + vbCrLf
                    resultStr = resultStr + "<id>" + CStr(siteLoop) + "</id>" + vbCrLf
                    resultStr = resultStr + "<bin>" + CStr(binArray(siteLoop)) + "</bin>" + vbCrLf
                    resultStr = resultStr + "</site>" + vbCrLf
                End If
            Next
            resultStr = resultStr + "</teradyne>"

            Dim fso As Object
            Set fso = CreateObject("Scripting.FileSystemObject")
            Dim oFile As Object
            Set oFile = fso.CreateTextFile(resultTmpFile)
            oFile.WriteLine resultStr
            oFile.Close
            Set fso = Nothing
            Set oFile = Nothing
            Name resultTmpFile As resultFile
        End If
    Next
    
End Sub
