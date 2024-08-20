# USGS_Parser-Alarm (Chrome_Extension)
By parsing USGS earthquake geojson, it alerts with a TTS and popup with given options. <br />
eq.png is created by bing AI DALL·E3; <br />
Coded by JunSung Lee (ljs_fr@live.com)

# LICENSE & COPYRIGHTS <br />
Every geojson is under rights of USGS (not included in this source but its(geojson) url && only used when program is running) <br />
Also, This extension is not meant to store geojson, but chrome cache algorithm and [devtools: extension log].<br />
Depends on how user gives an option...  <br />
**Credit: U.S. Geological Survey**   <br />
**Department of the Interior/USGS**  <br />
**U.S. Geological Survey/photo by Jane Doe (if the photographer/artist is known)**  <br />
[**USGS COPYRIGHT POLICY**](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits)  <br />
**This is opensource freeware (no cost)** <br />
[**Acknowledging or Crediting USGS**](https://www.usgs.gov/information-policies-and-instructions/acknowledging-or-crediting-usgs) <br />
**Else, follows GPLv3**  <br />
Install: [**Extension**](https://chrome.google.com/webstore/detail/dplogfgdbafegaplfhlnmoagoeibodeb) <br />
※ eq.png is created by bing AI DALL·E3; follows no_copyright <br />


# USGS Alert Program Manual

### 1. Supported Features

#### § Earthquake Magnitude Setting and USGS Website Display
- Users can set a specific magnitude threshold.<br />
- Users can set a change detection time.<br />
- **Update on August 15, 2024:**<br />
  - **Previous:** Detected only changes in magnitude/status within the set time.<br />
  - **Changed:** Now detects new events, magnitude changes, and status updates.<br />
  - **Example:** If a user sets the time to 1 hour, and an event occurs 2 hours ago, it will be updated as a new event, but no alarm will be triggered if the event exceeds the specified magnitude.<br />
- The USGS website will display the event with different colors based on the event’s status:<br />
  1. **No color:** Not applicable.<br />
  2. **Green:** Above a certain magnitude, not reviewed.<br />
  3. **Pink:** Above a certain magnitude, reviewed.<br />
  4. **Yellow:** Above a certain magnitude, with a third status (?).

#### § RAM Optimization (Automatic Restart) and Status Check Window
- The program automatically restarts.<br />
- Even if it restarts, alarms will not trigger again for specific events where they have already been triggered.<br />
- Status checks (USGS connection status).

#### § Earthquake Alarm: New Event, Magnitude Change, and Status Change
- Popup and TTS (Text-To-Speech) playback based on magnitude and status [REVIEWED, AUTOMATIC, UNDEFINED].<br />
- Popup and TTS playback when there is a magnitude change or status change at a specific magnitude.<br />
- Popup and TTS playback for status changes within the same magnitude.<br />
- Multiple popups and TTS playback for multiple events.<br />
- Popup automatically closes after 60 seconds.<br />
- If another event occurs within 60 seconds after a popup is created, all popups restart the 60-second countdown.<br />
- Settings for variables in the settings window are saved in Chrome until the program is uninstalled.

#### § Support for Event Verification through DEV CONSOLE
- GEOJSON file updates: Supports log verification for event deletions and additions.<br />
- Verification of alarm-triggered events.<br />
- Various event-related tests [variable editing].

### 2. FAQ (User Precautions)

#### § How to Use the Program
- The algorithm automatically starts when accessing the USGS website if the program is installed.

#### § If It Does Not Work or Malfunctions
- **[Not Working]:** Check if the program is running in the extension.<br />
- **[Malfunctioning]:** Restart Chrome.

#### § Alarm Does Not Trigger Despite Setting the Magnitude (Important)
- In the USGS GEOJSON magnitude data, the decimal point can extend beyond 8 places, but most are published with 2 decimal places (e.g., 2.16, 2.61). When displayed on the official USGS website, they are rounded (e.g., 2.16 -> 2.2, 2.61 -> 2.6).<br />
- To receive notifications for events with a magnitude of 6 or higher based on the USGS website, you should set the magnitude to 5.95.
