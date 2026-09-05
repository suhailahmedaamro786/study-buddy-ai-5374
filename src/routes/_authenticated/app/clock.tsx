import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/clock")({
  component: WorldClockPage,
});

interface TimeZone {
  id: string;
  name: string;
  offset: string;
  city: string;
}

const PRESET_TIMEZONES: TimeZone[] = [
  { id: "UTC", name: "UTC", offset: "+0:00", city: "London" },
  { id: "America/New_York", name: "EST", offset: "-5:00", city: "New York" },
  { id: "America/Los_Angeles", name: "PST", offset: "-8:00", city: "Los Angeles" },
  { id: "America/Chicago", name: "CST", offset: "-6:00", city: "Chicago" },
  { id: "Europe/London", name: "GMT", offset: "+0:00", city: "London" },
  { id: "Europe/Paris", name: "CET", offset: "+1:00", city: "Paris" },
  { id: "Europe/Tokyo", name: "JST", offset: "+9:00", city: "Tokyo" },
  { id: "Australia/Sydney", name: "AEDT", offset: "+11:00", city: "Sydney" },
  { id: "Asia/Dubai", name: "GST", offset: "+4:00", city: "Dubai" },
  { id: "Asia/Singapore", name: "SGT", offset: "+8:00", city: "Singapore" },
  { id: "Asia/Hong_Kong", name: "HKT", offset: "+8:00", city: "Hong Kong" },
  { id: "Asia/Bangkok", name: "ICT", offset: "+7:00", city: "Bangkok" },
  { id: "Asia/Kolkata", name: "IST", offset: "+5:30", city: "India" },
  { id: "Pacific/Auckland", name: "NZDT", offset: "+13:00", city: "Auckland" },
  { id: "Brazil/Sao_Paulo", name: "BRT", offset: "-3:00", city: "São Paulo" },
  { id: "Canada/Toronto", name: "EST", offset: "-5:00", city: "Toronto" },
];

function WorldClockPage() {
  const [timezones, setTimezones] = useState<TimeZone[]>([
    PRESET_TIMEZONES[0],
    PRESET_TIMEZONES[1],
    PRESET_TIMEZONES[6],
  ]);
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [isAddingTz, setIsAddingTz] = useState(false);
  const [searchTz, setSearchTz] = useState("");

  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {};
      timezones.forEach(tz => {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz.id,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        times[tz.id] = formatter.format(new Date());
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [timezones]);

  const addTimezone = (tz: TimeZone) => {
    if (!timezones.find(t => t.id === tz.id)) {
      setTimezones([...timezones, tz]);
      setSearchTz("");
      setIsAddingTz(false);
    }
  };

  const removeTimezone = (id: string) => {
    setTimezones(timezones.filter(tz => tz.id !== id));
  };

  const filteredTz = PRESET_TIMEZONES.filter(
    tz =>
      !timezones.find(t => t.id === tz.id) &&
      (tz.name.toLowerCase().includes(searchTz.toLowerCase()) ||
        tz.city.toLowerCase().includes(searchTz.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">World Clock</h1>
          </div>
          <p className="text-muted-foreground">Check the time across multiple time zones</p>
        </motion.div>

        {/* Add Timezone Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {!isAddingTz ? (
            <Button
              onClick={() => setIsAddingTz(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Time Zone
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 max-w-md"
            >
              <Input
                type="text"
                placeholder="Search time zone or city..."
                value={searchTz}
                onChange={e => setSearchTz(e.target.value)}
                autoFocus
                className="text-base"
              />
              {searchTz && filteredTz.length > 0 && (
                <div className="border rounded-lg bg-card max-h-64 overflow-y-auto">
                  {filteredTz.slice(0, 10).map(tz => (
                    <button
                      key={tz.id}
                      onClick={() => addTimezone(tz)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-sm"
                    >
                      <div className="font-medium">{tz.city}</div>
                      <div className="text-xs text-muted-foreground">{tz.name} {tz.offset}</div>
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setIsAddingTz(false)}
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Clock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timezones.map((tz, idx) => (
            <motion.div
              key={tz.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{tz.city}</h2>
                      <p className="text-primary/80 text-sm">{tz.name} • {tz.offset}</p>
                    </div>
                    {timezones.length > 1 && (
                      <button
                        onClick={() => removeTimezone(tz.id)}
                        className="hover:bg-white/20 rounded-lg p-1 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Digital Clock Display */}
                  <div className="font-mono text-5xl font-bold tracking-wider mb-2">
                    {currentTimes[tz.id] || "00:00:00"}
                  </div>

                  {/* Analog Clock */}
                  <AnalogClock timezone={tz.id} />
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Date:</span>
                    <span className="font-medium">
                      {new Intl.DateTimeFormat("en-US", {
                        timeZone: tz.id,
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        weekday: "long",
                      }).format(new Date())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Offset from UTC:</span>
                    <span className="font-medium font-mono">{tz.offset}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {timezones.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl text-muted-foreground">No time zones added yet</p>
            <p className="text-sm text-muted-foreground mt-2">Add one to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AnalogClock({ timezone }: { timezone: string }) {
  const [rotation, setRotation] = useState({ hour: 0, minute: 0, second: 0 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      
      const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
      const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
      const second = parseInt(parts.find(p => p.type === "second")?.value || "0");

      setRotation({
        hour: (hour % 12) * 30 + minute * 0.5,
        minute: minute * 6 + second * 0.1,
        second: second * 6,
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Clock face */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/30" />

        {/* Hour markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 50 + 42 * Math.cos(angle - Math.PI / 2);
          const y1 = 50 + 42 * Math.sin(angle - Math.PI / 2);
          const x2 = 50 + 45 * Math.cos(angle - Math.PI / 2);
          const y2 = 50 + 45 * Math.sin(angle - Math.PI / 2);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/50"
            />
          );
        })}

        {/* Hour hand */}
        <line
          x1="50"
          y1="50"
          x2={50 + 20 * Math.sin((rotation.hour * Math.PI) / 180)}
          y2={50 - 20 * Math.cos((rotation.hour * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-primary"
          style={{ transition: "all 0.5s ease" }}
        />

        {/* Minute hand */}
        <line
          x1="50"
          y1="50"
          x2={50 + 28 * Math.sin((rotation.minute * Math.PI) / 180)}
          y2={50 - 28 * Math.cos((rotation.minute * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
          style={{ transition: "all 0.5s ease" }}
        />

        {/* Second hand */}
        <line
          x1="50"
          y1="50"
          x2={50 + 32 * Math.sin((rotation.second * Math.PI) / 180)}
          y2={50 - 32 * Math.cos((rotation.second * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="text-red-500"
          style={{ transition: "all 0.05s linear" }}
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="2.5" fill="currentColor" className="text-primary" />
      </svg>
    </div>
  );
}
