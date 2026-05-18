#pragma once


#define WIFI_SSID "GreenLife_#"
#define WIFI_PASSWORD "#gone@*555*@"

#define WS_HOST "home-iot.onrender.com" // your devices IP (localhost might not work)
#define WS_PORT 5000
#define WS_PATH "/socket.io/?EIO=4&transport=websocket"

// NTP server and timezone (Bangladesh = UTC+6)
#define ntpServer "pool.ntp.org"
#define gmtOffset_sec (6 * 3600)  // UTC+6
#define daylightOffset_sec 0


#define RETRY_DELAY_MS 900000 // 15 minutes
// #define RETRY_DELAY_MS 30000 // 30 sec

#define MANUAL_PUMP_TARGET_LIMIT 10 // 10L max for manual pump activationI


//RF Remote Control--------
#define RF_Light1 12928095
#define RF_Light2 12928087
#define RF_Fan 12928084
#define RF_FanUP 12928081
#define RF_FanDown 12928083
#define RF_Power 12928082
#define RF_bit_length 24