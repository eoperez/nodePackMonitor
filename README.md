# nodePackMonitor
Near realtime monitoring software for MPPSolar PIP and PackMonitor. This was tested in a PIP5048MG, in theory it should work with any PIP.

## Setup
This software is built using NodeJS, Express, React and Material UI along with several libraries needed to communicate, collect and display PIP information. I'll discuss 2 option for setup your monitoring station:

### Option 1 - DIY
1. Download and install Node and NPM bundle: https://nodejs.org/en/download/ 
2. Download and unzip this repo: https://github.com/eoperez/nodePackMonitor/archive/master.zip
3. Open command line window and change directory to where you extracted the zip in step #2
4. Type command:
    > node run setup

   this step might take a couple of minutes. 
5. Just go to http://localhost:5000 or your [Computer IP]:5000

### Option 2 - Raspberry Pi Image
TBD
