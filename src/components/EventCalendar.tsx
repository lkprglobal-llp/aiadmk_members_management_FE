import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, ArrowLeft, Users, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiService, Event } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface EventCalendarProps {
  onBack: () => void;
}

export function EventCalendar({ onBack }: EventCalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'party',
    location: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const filterEvents = useCallback(() => {
    if (selectedFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === selectedFilter));
    }
  }, [selectedFilter, events]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getEvents();
      setEvents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in title, date, and time",
        variant: "destructive",
      });
      return;
    }

    try {
      const addedEvent = await apiService.createEvent(newEvent);
      setEvents([...events, addedEvent]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'party',
        location: '',
      });
      setIsAddingEvent(false);
      toast({
        title: "Success",
        description: "Event added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = filteredEvents
    .filter(event => new Date(event.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-primary" />
              <span>Events Calendar</span>
            </h1>
            <p className="text-muted-foreground">Party and government events schedule</p>
          </div>
        </div>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogTrigger asChild>
            <Button className="btn-hero flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Create a new party or government event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Title *</Label>
                <Input
                  id="event-title"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Type *</Label>
                <Select value={newEvent.type} onValueChange={(value: 'party' | 'government') => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="party">Party Event</SelectItem>
                    <SelectItem value="government">Government Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date *</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time *</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  placeholder="Event location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent} className="btn-hero">
                  Add Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card className="card-gradient">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label>Filter by type:</Label>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="party">Party Events</SelectItem>
                <SelectItem value="government">Government Events</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Total: {filteredEvents.length} events</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-primary">
                <Calendar className="w-5 h-5" />
                <span>Upcoming Events</span>
              </CardTitle>
              <CardDescription>
                {upcomingEvents.length} upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="card-member p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                      <Badge variant={event.type === 'party' ? 'default' : 'secondary'} className="ml-2">
                        {event.type === 'party' ? (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>Party</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>Government</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Past Events */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>Past Events</span>
              </CardTitle>
              <CardDescription>
                {pastEvents.length} completed events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No past events</p>
                </div>
              ) : (
                pastEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="card-member p-4 space-y-3 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {event.type === 'party' ? (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>Party</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>Government</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {pastEvents.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  and {pastEvents.length - 5} more...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}