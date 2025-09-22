// import { useState, useEffect } from 'react';
// import { Calendar, Clock, MapPin, Plus, ArrowLeft, Users, Building } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { apiService, Event } from '@/services/api';
// import { useToast } from '@/hooks/use-toast';
// import { useCallback } from 'react';

// interface EventCalendarProps {
//   onBack: () => void;
// }

// export function EventCalendar({ onBack }: EventCalendarProps) {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
//   const [selectedFilter, setSelectedFilter] = useState<string>('all');
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAddingEvent, setIsAddingEvent] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//   const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
//     title: '',
//     description: '',
//     date: '',
//     time: '',
//     type: 'party',
//     location: '',
//     image: '' // single image (if multiple, make array<string>)
//   });
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const filterEvents = useCallback(() => {
//     if (selectedFilter === 'all') {
//       setFilteredEvents(events);
//     } else {
//       setFilteredEvents(events.filter(event => event.type === selectedFilter));
//     }

//     if (selectedDate == '') {
//       setFilteredEvents(events);
//     }
//     else {
//       setFilteredEvents(events.filter(event => event.date === selectedDate));
//     }
//   }, [selectedFilter, events, selectedDate]);

//   useEffect(() => {
//     filterEvents();
//   }, [filterEvents]);

//   const fetchEvents = async () => {
//     try {
//       setIsLoading(true);
//       const data = await apiService.getEvents();
//       setEvents(data);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch events",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddEvent = async () => {
//     if (!newEvent.title || !newEvent.date || !newEvent.time) {
//       toast({
//         title: "Validation Error",
//         description: "Please fill in title, date, and time",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const addedEvent = await apiService.addEvent(newEvent);
//       setEvents([...events, addedEvent]);
//       setNewEvent({
//         title: '',
//         description: '',
//         date: '',
//         time: '',
//         type: 'party',
//         location: '',
//       });
//       setIsAddingEvent(false);
//       toast({
//         title: "Success",
//         description: "Event added successfully!",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add event",
//         variant: "destructive",
//       });
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (timeString: string) => {
//     return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-IN', {
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const upcomingEvents = filteredEvents
//     .filter(event => new Date(event.date) >= new Date())
//     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//   const pastEvents = filteredEvents
//     .filter(event => new Date(event.date) < new Date())
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div className="flex items-center space-x-4">
//           <Button onClick={onBack} variant="outline" size="sm">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
//               <Calendar className="w-8 h-8 text-primary" />
//               <span>Events Calendar</span>
//             </h1>
//             <p className="text-muted-foreground">Party and government events schedule</p>
//           </div>
//         </div>
//         <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
//           <DialogTrigger asChild>
//             <Button className="btn-hero flex items-center space-x-2">
//               <Plus className="w-4 h-4" />
//               <span>Add Event</span>
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Add New Event</DialogTitle>
//               <DialogDescription>
//                 Create a new party or government event
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="event-title">Title *</Label>
//                 <Input
//                   id="event-title"
//                   placeholder="Event title"
//                   value={newEvent.title}
//                   onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="event-type">Type *</Label>
//                 <Select value={newEvent.type} onValueChange={(value: 'party' | 'government') => setNewEvent({ ...newEvent, type: value })}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="party">Party Event</SelectItem>
//                     <SelectItem value="government">Government Event</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="event-date">Date *</Label>
//                   <Input
//                     id="event-date"
//                     type="date"
//                     value={newEvent.date}
//                     onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="event-time">Time *</Label>
//                   <Input
//                     id="event-time"
//                     type="time"
//                     value={newEvent.time}
//                     onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="event-picture">Events Picture *</Label>
//                 <Input
//                   id="event-picture"
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="event-location">Location</Label>
//                 <Input
//                   id="event-location"
//                   placeholder="Event location"
//                   value={newEvent.location}
//                   onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="event-description">Description</Label>
//                 <Textarea
//                   id="event-description"
//                   placeholder="Event description"
//                   value={newEvent.description}
//                   onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
//                   rows={3}
//                 />
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleAddEvent} className="btn-hero">
//                   Add Event
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Filter */}
//       <Card className="card-gradient">
//         <CardContent className="p-4">
//           <div className="flex items-center space-x-4">
//             <Label>Filter by type:</Label>
//             <Select value={selectedFilter} onValueChange={setSelectedFilter}>
//               <SelectTrigger className="w-48">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Events</SelectItem>
//                 <SelectItem value="party">Party Events</SelectItem>
//                 <SelectItem value="government">Government Events</SelectItem>
//               </SelectContent>
//             </Select>
//             <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//               <Label>Date:</Label>
//               <Input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//               {selectedDate && (
//                 <Button variant="ghost" size="sm" onClick={() => setSelectedDate('')}>
//                   Clear
//                 </Button>
//               )}
//             </div>
//             <span>Total: {filteredEvents.length} events</span>
//           </div>
//         </CardContent>
//       </Card>

//       {isLoading ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Upcoming Events */}
//           <Card className="card-gradient">
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2 text-primary">
//                 <Calendar className="w-5 h-5" />
//                 <span>Upcoming Events</span>
//               </CardTitle>
//               <CardDescription>
//                 {upcomingEvents.length} upcoming events
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {upcomingEvents.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">No upcoming events</p>
//                 </div>
//               ) : (
//                 upcomingEvents.map((event) => (
//                   <div key={event.id} className="card-member p-4 space-y-3">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-foreground">{event.title}</h3>
//                         {event.description && (
//                           <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
//                         )}
//                       </div>
//                       <Badge variant={event.type === 'party' ? 'default' : 'secondary'} className="ml-2">
//                         {event.type === 'party' ? (
//                           <div className="flex items-center space-x-1">
//                             <Users className="w-3 h-3" />
//                             <span>Party</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center space-x-1">
//                             <Building className="w-3 h-3" />
//                             <span>Government</span>
//                           </div>
//                         )}
//                       </Badge>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
//                       <div className="flex items-center space-x-1">
//                         <Calendar className="w-4 h-4" />
//                         <span>{formatDate(event.date)}</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <Clock className="w-4 h-4" />
//                         <span>{formatTime(event.time)}</span>
//                       </div>
//                       {event.location && (
//                         <div className="flex items-center space-x-1">
//                           <MapPin className="w-4 h-4" />
//                           <span>{event.location}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </CardContent>
//           </Card>

//           {/* Past Events */}
//           <Card className="card-gradient">
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2 text-muted-foreground">
//                 <Calendar className="w-5 h-5" />
//                 <span>Past Events</span>
//               </CardTitle>
//               <CardDescription>
//                 {pastEvents.length} completed events
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {pastEvents.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">No past events</p>
//                 </div>
//               ) : (
//                 pastEvents.slice(0, 10).map((event) => (
//                   <div key={event.id} className="card-member p-4 space-y-3 opacity-75">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-foreground">{event.title}</h3>
//                         {event.description && (
//                           <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
//                         )}
//                       </div>
//                       <Badge variant="outline" className="ml-2">
//                         {event.type === 'party' ? (
//                           <div className="flex items-center space-x-1">
//                             <Users className="w-3 h-3" />
//                             <span>Party</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center space-x-1">
//                             <Building className="w-3 h-3" />
//                             <span>Government</span>
//                           </div>
//                         )}
//                       </Badge>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
//                       <div className="flex items-center space-x-1">
//                         <Calendar className="w-4 h-4" />
//                         <span>{formatDate(event.date)}</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <Clock className="w-4 h-4" />
//                         <span>{formatTime(event.time)}</span>
//                       </div>
//                       {event.location && (
//                         <div className="flex items-center space-x-1">
//                           <MapPin className="w-4 h-4" />
//                           <span>{event.location}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//               {pastEvents.length > 5 && (
//                 <p className="text-center text-sm text-muted-foreground">
//                   and {pastEvents.length - 5} more...
//                 </p>
//               )}
//             </CardContent>
//           </Card>

//           {/* Event Details Modal */}
//           <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
//             <DialogContent className="max-w-2xl">
//               {selectedEvent && (
//                 <>
//                   <DialogHeader>
//                     <DialogTitle>{selectedEvent.title}</DialogTitle>
//                     <DialogDescription>
//                       {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="space-y-4">
//                     {selectedEvent.image && (
//                       <img
//                         src={selectedEvent.image}
//                         alt={selectedEvent.title}
//                         className="w-full h-64 object-cover rounded-lg"
//                       />
//                     )}
//                     {selectedEvent.description && (
//                       <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
//                     )}
//                     {selectedEvent.location && (
//                       <div className="flex items-center space-x-2 text-muted-foreground">
//                         <MapPin className="w-4 h-4" />
//                         <span>{selectedEvent.location}</span>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}
//             </DialogContent>
//           </Dialog>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useState, useEffect, useCallback } from 'react';
// import { Calendar, Clock, MapPin, Plus, ArrowLeft, Users, Building, Image as ImageIcon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { apiService, Event } from '@/services/api';
// import { useToast } from '@/hooks/use-toast';

// interface EventCalendarProps {
//   onBack: () => void;
// }

// export function EventCalendar({ onBack }: EventCalendarProps) {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
//   const [selectedFilter, setSelectedFilter] = useState<string>('all');
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAddingEvent, setIsAddingEvent] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//   const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
//     title: '',
//     description: '',
//     date: '',
//     time: '',
//     type: 'party',
//     location: '',
//     image: '' // single image (if multiple, make array<string>)
//   });
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const filterEvents = useCallback(() => {
//     let temp = [...events];

//     if (selectedFilter !== 'all') {
//       temp = temp.filter(event => event.type === selectedFilter);
//     }

//     if (selectedDate) {
//       temp = temp.filter(event => event.date === selectedDate);
//     }

//     setFilteredEvents(temp);
//   }, [selectedFilter, events, selectedDate]);

//   useEffect(() => {
//     filterEvents();
//   }, [filterEvents]);

//   const fetchEvents = async () => {
//     try {
//       setIsLoading(true);
//       const data = await apiService.getEvents();
//       setEvents(data);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch events",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (timeString: string) => {
//     return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-IN', {
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const upcomingEvents = filteredEvents
//     .filter(event => new Date(event.date) >= new Date())
//     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//   const pastEvents = filteredEvents
//     .filter(event => new Date(event.date) < new Date())
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// return (
//   <div className="space-y-6">
//     {/* Header */}
//     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//       <div className="flex items-center space-x-4">
//         <Button onClick={onBack} variant="outline" size="sm">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
//             <Calendar className="w-8 h-8 text-primary" />
//             <span>Events Calendar</span>
//           </h1>
//           <p className="text-muted-foreground">Party and government events schedule</p>
//         </div>
//       </div>
//     </div>

//     {/* Filters */}
//     <Card className="card-gradient">
//       <CardContent className="p-4 flex flex-wrap gap-4 items-center">
//         <div className="flex items-center space-x-2">
//           <Label>Type:</Label>
//           <Select value={selectedFilter} onValueChange={setSelectedFilter}>
//             <SelectTrigger className="w-40">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Events</SelectItem>
//               <SelectItem value="party">Party Events</SelectItem>
//               <SelectItem value="government">Government Events</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Label>Date:</Label>
//           <Input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//           />
//           {selectedDate && (
//             <Button variant="ghost" size="sm" onClick={() => setSelectedDate('')}>
//               Clear
//             </Button>
//           )}
//         </div>
//         <span className="ml-auto text-sm text-muted-foreground">
//           Total: {filteredEvents.length} events
//         </span>
//       </CardContent>
//     </Card>

//     {isLoading ? (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//       </div>
//     ) : (
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Upcoming */}
//         <Card className="card-gradient">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2 text-primary">
//               <Calendar className="w-5 h-5" />
//               <span>Upcoming Events</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {upcomingEvents.length === 0 ? (
//               <p className="text-muted-foreground">No upcoming events</p>
//             ) : (
//               upcomingEvents.map((event) => (
//                 <div
//                   key={event.id}
//                   onClick={() => setSelectedEvent(event)}
//                   className="cursor-pointer card-member p-4 space-y-3 hover:bg-accent rounded-lg transition"
//                 >
//                   <div className="flex items-start justify-between">
//                     <h3 className="font-semibold">{event.title}</h3>
//                     <Badge>{event.type}</Badge>
//                   </div>
//                   {event.image && (
//                     <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded-md" />
//                   )}
//                   <p className="text-sm text-muted-foreground">{event.description}</p>
//                   <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                     <Calendar className="w-4 h-4" /> {formatDate(event.date)}
//                     <Clock className="w-4 h-4" /> {formatTime(event.time)}
//                     {event.location && (
//                       <>
//                         <MapPin className="w-4 h-4" /> {event.location}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>

//         {/* Past */}
//         <Card className="card-gradient">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2 text-muted-foreground">
//               <Calendar className="w-5 h-5" />
//               <span>Past Events</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {pastEvents.length === 0 ? (
//               <p className="text-muted-foreground">No past events</p>
//             ) : (
//               pastEvents.map((event) => (
//                 <div
//                   key={event.id}
//                   onClick={() => setSelectedEvent(event)}
//                   className="cursor-pointer card-member p-4 space-y-3 hover:bg-accent rounded-lg transition"
//                 >
//                   <h3 className="font-semibold">{event.title}</h3>
//                   {event.image && (
//                     <img src={event.image} alt={event.title} className="w-full h-32 object-cover rounded-md" />
//                   )}
//                   <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                     <Calendar className="w-4 h-4" /> {formatDate(event.date)}
//                     <Clock className="w-4 h-4" /> {formatTime(event.time)}
//                   </div>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     )}

//     {/* Event Details Modal */}
//     <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
//       <DialogContent className="max-w-2xl">
//         {selectedEvent && (
//           <>
//             <DialogHeader>
//               <DialogTitle>{selectedEvent.title}</DialogTitle>
//               <DialogDescription>{formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               {selectedEvent.image && (
//                 <img
//                   src={selectedEvent.image}
//                   alt={selectedEvent.title}
//                   className="w-full h-64 object-cover rounded-lg"
//                 />
//               )}
//               {selectedEvent.description && (
//                 <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
//               )}
//               {selectedEvent.location && (
//                 <div className="flex items-center space-x-2 text-muted-foreground">
//                   <MapPin className="w-4 h-4" />
//                   <span>{selectedEvent.location}</span>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   </div>
// );
// }
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ArrowLeft,
  Users,
  Building,
  Image as ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiService, Event } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { set } from "date-fns";
import { on } from "events";

const BASE_URL = "http://localhost:5253/";

interface EventCalendarProps {
  onBack: () => void;
}

export function EventCalendar({ onBack }: EventCalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "party",
    location: "",
    images: [],
  });
  const { toast } = useToast();

  // Pagination state for Upcoming & Past separately
  const [upcomingPage, setUpcomingPage] = useState(0);
  const [upcomingRowsPerPage, setUpcomingRowsPerPage] = useState(5);
  const [pastPage, setPastPage] = useState(0);
  const [pastRowsPerPage, setPastRowsPerPage] = useState(5);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: resolve event.image to actual src(s).
  const resolveImageSources = (imageField): string[] => {
    if (!imageField) return [];
    // If already array
    if (Array.isArray(imageField)) {
      return imageField.map((s) => resolveSingle(s)).filter(Boolean) as string[];
    }
    // If string: maybe JSON array or single path
    if (typeof imageField === "string") {
      // try parse JSON array string
      try {
        const parsed = JSON.parse(imageField);
        if (Array.isArray(parsed)) return parsed.map((s) => resolveSingle(s)).filter(Boolean) as string[];
      } catch (_) {
        // not json
      }
      return [resolveSingle(imageField)].filter(Boolean) as string[];
    }
    return [];
  };

  function resolveSingle(s: string | undefined | null): string | undefined {
    if (!s) return undefined;
    const trimmed = s.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    // If path starts with slash, avoid duplicate //
    if (trimmed.startsWith("/")) return `${BASE_URL.replace(/\/+$/, "")}${trimmed}`;
    // otherwise treat as relative path saved in DB like "uploads/events/xyz.jpg"
    return `${BASE_URL.replace(/\/+$/, "")}/${trimmed}`;
  }

  // Fetch events: normalize response
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getEvents();

      let all: Event[] = [];

      if (!data) {
        all = [];
      }
      // Case 1: API gives direct array
      else if (Array.isArray(data)) {
        all = data;
      }
      // Case 2: API gives { success, events: [...] }
      else if ("events" in data && Array.isArray(data.events)) {
        all = data.events;
      }
      // Case 3: API gives { success, upcoming: [...], past: [...] }
      else if (
        ("upcoming" in data && Array.isArray(data.upcoming)) ||
        ("past" in data && Array.isArray(data.past))
      ) {
        all = [
          ...(Array.isArray(data.upcoming) ? data.upcoming : []),
          ...(Array.isArray(data.past) ? data.past : []),
        ];
      }
      // Normalize each event's image field to array of URLs
      all = all.map((ev) => ({
        ...ev,
        images: resolveImageSources(ev.images),
      }));

      setEvents(all);
    } catch (err) {
      console.error("Fetch events error:", err);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- date utils ---
  const parseEventDateTime = (date?: string, time?: string): Date | null => {
    if (!date) return null;

    try {
      // Case 1: Already ISO string (has T)
      if (date.includes("T")) {
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
      }

      // Case 2: Plain YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const t = time && time.trim() !== "" ? time.trim() : "00:00";
        const iso = `${date}T${t.length === 5 ? t + ":00" : t}`;
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
      }

      // Case 3: MySQL datetime (YYYY-MM-DD HH:mm:ss)
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(date + (time ? " " + time : ""))) {
        const iso = (date + (time ? " " + time : "")).replace(" ", "T");
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
      }

      // Fallback
      const fallback = new Date(`${date} ${time || "00:00"}`);
      return isNaN(fallback.getTime()) ? null : fallback;
    } catch {
      return null;
    }
  };

  const toLocalYYYYMMDD = (dIn?: Date | string | null): string | null => {
    if (!dIn) return null;
    const d = typeof dIn === "string" ? new Date(dIn) : dIn;
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const getEventLocalDate = (ev): string | null => {
    const dt = parseEventDateTime(ev.date, ev.time);
    return dt ? toLocalYYYYMMDD(dt) : null;
  };

  // --- Filtering: apply type and date filters ---
  const filterEvents = useCallback(() => {
    let temp = [...events];

    if (selectedFilter !== "all") {
      temp = temp.filter((ev) => ev.type === selectedFilter);
    }

    if (selectedDate) {
      temp = temp.filter((ev) => {
        const normalized = getEventLocalDate(ev);
        return normalized === selectedDate;
      });
    }

    setFilteredEvents(temp);
    setUpcomingPage(0);
    setPastPage(0);
  }, [events, selectedFilter, selectedDate]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  // --- Separate upcoming and past events with sorting ---
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter((event) => {
        const evDate = parseEventDateTime(event.date, event.time);
        // console.log("Upcoming check:", event.title, "=>", evDate);
        return evDate !== null && evDate.getTime() >= now.getTime();
      })
      .sort(
        (a, b) =>
          (parseEventDateTime(a.date, a.time)?.getTime() ?? 0) -
          (parseEventDateTime(b.date, b.time)?.getTime() ?? 0)
      );
  }, [filteredEvents]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter((event) => {
        const evDate = parseEventDateTime(event.date, event.time);
        return evDate !== null && evDate.getTime() < now.getTime();
      })
      .sort(
        (a, b) =>
          (parseEventDateTime(b.date, b.time)?.getTime() ?? 0) -
          (parseEventDateTime(a.date, a.time)?.getTime() ?? 0)
      );
  }, [filteredEvents]);

  // --- Pagination slices ---
  const upcomingSlice = useMemo(() => {
    const start = upcomingPage * upcomingRowsPerPage;
    return upcomingEvents.slice(start, start + upcomingRowsPerPage);
  }, [upcomingEvents, upcomingPage, upcomingRowsPerPage]);

  const pastSlice = useMemo(() => {
    const start = pastPage * pastRowsPerPage;
    return pastEvents.slice(start, start + pastRowsPerPage);
  }, [pastEvents, pastPage, pastRowsPerPage]);

  // --- Formatting helpers ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "—";
    const d = new Date(`2000-01-01 ${timeString}`);
    if (isNaN(d.getTime())) return timeString;
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Add event from modal
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
      const formData = new FormData();

      Object.entries(newEvent).forEach(([key, value]) => {
        if (value) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value as string);
          }
        }
      });

      if (newEvent.images && Array.isArray(newEvent.images) && newEvent.images.length > 0) {
        newEvent.images.forEach((image) => {
          formData.append("images", image); // multer field name
        });
      }

      const response = await apiService.addEvent(formData);
      console.log("Add event response:", response);

      // Update local state with the created event from the response
      if (response && response.id) {
        setEvents((prev) => [...prev, response]);
        setNewEvent({ title: "", description: "", date: "", time: "", type: "", location: "", images: [] });
        setIsAddingEvent(false);
        toast({ title: "Success", description: "Event added successfully!" });
        onBack(); // Navigate back to main view
      } else {
        throw new Error(response.title || "Failed to add event");
      }
    } catch (err) {
      console.error("Add event error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add event",
        variant: "destructive",
      });
    }
  };

  // Delete event from modal
  const handleDeleteSelectedEvent = async () => {
    if (!selectedEvent) return;
    if (!confirm("Delete this event?")) return;
    try {
      await apiService.deleteEvent(selectedEvent.id);
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setSelectedEvent(null);
      toast({ title: "Deleted", description: "Event deleted successfully" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

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
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Title *</Label>
                <Input id="event-title" placeholder="Event title" value={newEvent.title || ""} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Type *</Label>
                <Select value={(newEvent.type as string) || "party"} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
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
                  <Input id="event-date" type="date" value={newEvent.date || ""} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time *</Label>
                  <Input id="event-time" type="time" value={newEvent.time || ""} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-picture">Event Picture</Label>
                <Input id="event-picture" type="file" multiple accept="image/*" onChange={(e) => setNewEvent({ ...newEvent, images: Array.from(e.target.files), })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <Input id="event-location" placeholder="Event location" value={newEvent.location || ""} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea id="event-description" placeholder="Event description" value={newEvent.description || ""} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={3} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                <Button onClick={handleAddEvent} className="btn-hero">Add Event</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Label>Type:</Label>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="party">Party Events</SelectItem>
                <SelectItem value="government">Government Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label>Date:</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            {selectedDate && <Button variant="ghost" size="sm" onClick={() => setSelectedDate("")}>Clear</Button>}
          </div>

          <span className="ml-auto text-sm text-muted-foreground">Total: {filteredEvents.length} events</span>
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
              <CardDescription>{upcomingEvents.length} upcoming events</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                <>
                  {upcomingSlice.map((event) => {
                    const imgs = resolveImageSources((event).images);
                    return (
                      <div key={event.id} className="card-member p-4 space-y-3 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{event.title}</h3>
                            {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                          </div>
                          <Badge variant={event.type === "party" ? "default" : "secondary"} className="ml-2">
                            {event.type === "party" ? (<div className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>Party</span></div>) : (<div className="flex items-center space-x-1"><Building className="w-3 h-3" /><span>Government</span></div>)}
                          </Badge>
                        </div>

                        {imgs.length > 0 ? (
                          <img src={imgs[0]} alt={event.title} className="w-full h-40 object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-40 rounded-md bg-gray-100 flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>{formatDate(event.date)}</span></div>
                          <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{formatTime(event.time)}</span></div>
                          {event.location && <div className="flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>}
                        </div>
                      </div>
                    );
                  })}

                  {/* pagination controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min(upcomingPage * upcomingRowsPerPage + 1, upcomingEvents.length)} - {Math.min((upcomingPage + 1) * upcomingRowsPerPage, upcomingEvents.length)} of {upcomingEvents.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={String(upcomingRowsPerPage)} onValueChange={(v) => { setUpcomingRowsPerPage(Number(v)); setUpcomingPage(0); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => setUpcomingPage((p) => Math.max(p - 1, 0))} disabled={upcomingPage === 0}><ChevronLeft className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setUpcomingPage((p) => (p + 1) * upcomingRowsPerPage < upcomingEvents.length ? p + 1 : p)} disabled={(upcomingPage + 1) * upcomingRowsPerPage >= upcomingEvents.length}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </>
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
              <CardDescription>{pastEvents.length} completed events</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {pastEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No past events</p>
                </div>
              ) : (
                <>
                  {pastSlice.map((event) => {
                    const imgs = resolveImageSources((event).images);
                    return (
                      <div key={event.id} className="card-member p-4 space-y-3 opacity-75 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{event.title}</h3>
                            {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {event.type === "party" ? (<div className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>Party</span></div>) : (<div className="flex items-center space-x-1"><Building className="w-3 h-3" /><span>Government</span></div>)}
                          </Badge>
                        </div>

                        {imgs.length > 0 ? (
                          <img src={imgs[0]} alt={event.title} className="w-full h-32 object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-32 rounded-md bg-gray-100 flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>{formatDate(event.date)}</span></div>
                          <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{formatTime(event.time)}</span></div>
                          {event.location && <div className="flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>}
                        </div>
                      </div>
                    );
                  })}

                  {/* pagination */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min(pastPage * pastRowsPerPage + 1, pastEvents.length)} - {Math.min((pastPage + 1) * pastRowsPerPage, pastEvents.length)} of {pastEvents.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={String(pastRowsPerPage)} onValueChange={(v) => { setPastRowsPerPage(Number(v)); setPastPage(0); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => setPastPage((p) => Math.max(p - 1, 0))} disabled={pastPage === 0}><ChevronLeft className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setPastPage((p) => (p + 1) * pastRowsPerPage < pastEvents.length ? p + 1 : p)} disabled={(pastPage + 1) * pastRowsPerPage >= pastEvents.length}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Event Details Modal */}
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              {selectedEvent && (
                <>
                  <DialogHeader className="mb-2 pb-1 border-b border-muted-foreground/20">
                    <DialogTitle className="flex items-center justify-between container">
                      <span>{selectedEvent.title}</span>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="destructive" onClick={handleDeleteSelectedEvent}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </DialogTitle>
                    <DialogDescription>
                      {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-2">
                    {/* multiple images carousel-ish: simple left/right gallery */}
                    <Gallery images={resolveImageSources((selectedEvent).images)} alt={selectedEvent.title} />

                    {selectedEvent.description && <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>}

                    {selectedEvent.location && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

/* Simple in-file gallery component (left/right). Keeps same lightweight aesthetic. */
function Gallery({ images, alt }: { images: string[]; alt?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [images]);
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center text-muted-foreground">
        <ImageIcon className="w-10 h-10" />
      </div>
    );
  }
  const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="relative">
      <img src={images[index]} alt={alt} className="w-full h-64 object-cover rounded-lg" />
      {images.length > 1 && (
        <>
          <Button size="sm" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={goPrev}><ChevronLeft className="w-5 h-5" /></Button>
          <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={goNext}><ChevronRight className="w-5 h-5" /></Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-2">
            {images.map((_, i) => <span key={i} className={`w-2 h-2 rounded-full ${i === index ? "bg-foreground" : "bg-muted-foreground/40"}`} />)}
          </div>
        </>
      )}
    </div>
  );
}
