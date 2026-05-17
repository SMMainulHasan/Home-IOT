#include "time_task.h"

void timeTask(void *pvParameters) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

    struct tm timeinfo;

    while (true) {
        if (getLocalTime(&timeinfo)) {
            Serial.println("[Time] synced (task)");
            vTaskDelete(NULL);
        }

        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
