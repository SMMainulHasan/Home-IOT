#include "time_manager.h"

int getHour(unsigned long now) {
  return (now % 86400) / 3600;
}