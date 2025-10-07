# Step-by-Step Deployment Instructions - BaseVac Production System

## Your Current Situation
- ✅ Python installed
- ✅ Files extracted to Desktop
- 🎯 Next: Start the local server

## Step 1: Locate Your Application Files

1. **Go to your Desktop**
2. **Look for a folder** with the application files
3. **The folder should contain:**
   - index.html
   - style.css
   - app.js
   - (other files)

**Note the exact folder name** - you'll need it in the next step.

## Step 2: Open Command Prompt

### Method A (Easiest):
1. **Hold Shift** and **right-click** on your application folder on Desktop
2. **Select** "Open PowerShell window here" or "Open command window here"
3. **Skip to Step 4** if this works

### Method B (If Method A doesn't work):
1. **Press** `Windows Key + R`
2. **Type** `cmd` and press Enter
3. **A black window opens** (Command Prompt)

## Step 3: Navigate to Your Desktop Folder

In the command window, type these commands **one by one**:

```
cd Desktop
```
**Press Enter**

Then type (replace "FOLDER_NAME" with your actual folder name):
```
cd FOLDER_NAME
```
**Press Enter**

**Example:** If your folder is called "production-app", type:
```
cd production-app
```

## Step 4: Start the Server

Type this command and press Enter:
```
python -m http.server 8080
```

### What You Should See:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

**✅ SUCCESS!** Your server is now running.

## Step 5: Access Your Application

1. **Open any web browser** (Chrome, Firefox, Edge)
2. **Type in address bar:** `http://localhost:8080`
3. **Press Enter**

**You should see the BaseVac Dental Production System!**

## Step 6: Bookmark for Daily Use

1. **While the app is open**, press `Ctrl + D`
2. **Save bookmark** as "BaseVac Production System"
3. **Use this bookmark daily** instead of typing the address

## Troubleshooting Common Issues

### Issue 1: "python is not recognized"
**Solution:**
- Python wasn't installed correctly
- Try: `py -m http.server 8080` instead
- Or reinstall Python with "Add to PATH" checked

### Issue 2: "Permission denied" or "Address already in use"
**Solution:**
- Try a different port: `python -m http.server 8081`
- Then access via: `http://localhost:8081`

### Issue 3: Can't find the folder
**Check these locations:**
- `C:\Users\[YourName]\Desktop\`
- Look for the extracted folder name
- Make sure you're in the right folder with index.html

### Issue 4: Browser shows "This site can't be reached"
**Solutions:**
- Make sure command window is still open and running
- Check the exact address: `http://localhost:8080`
- Try: `http://127.0.0.1:8080`

## Daily Usage Instructions

### Starting the System Each Day:
1. **Double-click** your application folder on Desktop
2. **Hold Shift + Right-click** inside the folder
3. **Select** "Open PowerShell window here"
4. **Type:** `python -m http.server 8080`
5. **Open browser** and go to your bookmark

### Stopping the System:
- **Close the command window** (black window)
- **Or press** `Ctrl + C` in the command window

## First-Time Setup in the Application

### After Opening the App:
1. **Click "Admin" tab**
2. **Verify team members** are correct (Mohsin, Kaiser, Mike)
3. **Add new team members** if needed
4. **Check task list** and add any missing tasks
5. **Set standard times** for important tasks

### Test the System:
1. **Click "Daily Report" tab**
2. **Fill out a test report**
3. **Submit it**
4. **Go to Dashboard** to see the data
5. **Try "Export to Excel"** to test data export

## Network Access (Optional)

### To Allow Other Computers to Access:

1. **Find your computer's IP address:**
   - Press `Windows Key + R`
   - Type `cmd` and Enter
   - Type `ipconfig` and Enter
   - Look for "IPv4 Address" (example: 192.168.1.100)

2. **Others can access using:**
   - `http://[YOUR-IP]:8080`
   - Example: `http://192.168.1.100:8080`

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Navigate to Desktop | `cd Desktop` |
| Navigate to folder | `cd folder-name` |
| Start server | `python -m http.server 8080` |
| Alternative start | `py -m http.server 8080` |
| Stop server | Press `Ctrl + C` |
| Check IP address | `ipconfig` |

## Important Notes

- **Keep the command window open** while using the app
- **Don't close it** or the server stops
- **The black window might show activity** when people use the app - this is normal
- **Data is saved in your browser** - don't clear browser data
- **Export to Excel regularly** for backups

## Success Checklist

- [ ] Command window shows "Serving HTTP on port 8080"
- [ ] Browser opens the BaseVac application at localhost:8080
- [ ] Can navigate between tabs (Daily Report, Dashboard, Admin)
- [ ] Can fill out and submit a test report
- [ ] Can export data to Excel
- [ ] Bookmark saved for daily access

**You're ready to use the production system!**

Need help? Check the command window for error messages and refer to the troubleshooting section above.