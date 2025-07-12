import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FiPlus, FiClock, FiCalendar, FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import eventService from '../../services/eventService';
import styles from './UpcomingEvents.module.css';

const getEventTypeStyle = (type) => {
  const styleMap = {
    meeting: styles.eventTypeMeeting,
    deadline: styles.eventTypeDeadline,
    call: styles.eventTypeCall,
    reminder: styles.eventTypeReminder,
  };
  return styleMap[type] || styles.eventTypeDefault;
};

const getEventTypeBadge = (type) => {
  const styleMap = {
    meeting: styles.badge + ' ' + styles.eventTypeMeeting,
    deadline: styles.badge + ' ' + styles.eventTypeDeadline,
    call: styles.badge + ' ' + styles.eventTypeCall,
    reminder: styles.badge + ' ' + styles.eventTypeReminder,
  };
  return (
    <span className={styleMap[type] || (styles.badge + ' ' + styles.eventTypeDefault)}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(Date.now() + 3600000), // 1 hour later
    type: 'meeting',
  });
  const [tempDate, setTempDate] = useState({
    start: '',
    end: ''
  });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getUpcomingEvents(5);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error(error.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatForDateTimeLocal = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field, value) => {
    setTempDate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const confirmDateTime = () => {
    try {
      let start = tempDate.start ? new Date(tempDate.start) : new Date(newEvent.start);
      let end = tempDate.end ? new Date(tempDate.end) : new Date(newEvent.end);

      // Ensure start is a valid date
      if (isNaN(start.getTime())) {
        start = new Date(newEvent.start);
      }
      
      // Ensure end is a valid date and after start
      if (isNaN(end.getTime()) || end <= start) {
        end = new Date(start);
        end.setHours(end.getHours() + 1);
      }

      setNewEvent(prev => ({
        ...prev,
        start,
        end
      }));

      // Clear temp dates after confirmation
      setTempDate({ start: '', end: '' });
      
      return true;
    } catch (error) {
      console.error('Error setting date/time:', error);
      toast.error('Invalid date/time selected');
      return false;
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    try {
      console.log('Current newEvent:', newEvent);
      console.log('Current tempDate:', tempDate);
      
      // If there are unconfirmed date changes, confirm them first
      if (tempDate.start || tempDate.end) {
        console.log('Found unconfirmed dates, confirming...');
        const confirmed = confirmDateTime();
        if (!confirmed) {
          console.log('Date/time confirmation failed');
          toast.error('Please confirm the date/time before saving');
          return;
        }
        console.log('Dates confirmed');
      }

      // Ensure we have valid dates
      if (!newEvent.start || !newEvent.end) {
        console.error('Missing start or end date');
        toast.error('Please select valid start and end times');
        return;
      }

      // Convert to Date objects if they're not already
      const startDate = newEvent.start instanceof Date ? newEvent.start : new Date(newEvent.start);
      const endDate = newEvent.end instanceof Date ? newEvent.end : new Date(newEvent.end);

      // Ensure end time is after start time
      if (startDate >= endDate) {
        console.error('End time is not after start time');
        toast.error('End time must be after start time');
        return;
      }

      // Create the event with proper date strings
      const eventToCreate = {
        title: newEvent.title.trim(),
        description: newEvent.description?.trim() || '',
        type: newEvent.type || 'meeting',
        start: startDate.toISOString(),
        end: endDate.toISOString()
      };
      
      console.log('Creating event:', eventToCreate);
      
      // Show loading state
      const loadingToast = toast.loading('Adding event...');
      
      try {
        const response = await fetch('http://localhost:5000/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(eventToCreate)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create event');
        }

        const createdEvent = await response.json();
        console.log('Event created:', createdEvent);
        
        await fetchEvents();
        
        // Reset form
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 3600000);
        
        setNewEvent({
          title: '',
          description: '',
          start: now,
          end: oneHourLater,
          type: 'meeting',
        });
        
        // Clear temp dates and close the form
        setTempDate({ start: '', end: '' });
        setIsAddingEvent(false);
        
        toast.update(loadingToast, {
          render: 'Event added successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } catch (apiError) {
        console.error('API Error:', apiError);
        toast.update(loadingToast, {
          render: `Failed to add event: ${apiError.message || 'Please try again'}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('Unexpected error in handleAddEvent:', error);
      // The error toast is already shown in the inner catch
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const loadingToast = toast.loading('Deleting event...');
      try {
        await eventService.deleteEvent(eventId);
        setEvents(events.filter(event => event._id !== eventId));
        toast.update(loadingToast, {
          render: 'Event deleted successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast.update(loadingToast, {
          render: `Failed to delete event: ${error.message || 'Please try again'}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FiCalendar className="h-5 w-5" />
          </div>
          <h3 className={styles.title}>Upcoming Events</h3>
        </div>
        <button
          onClick={() => setIsAddingEvent(!isAddingEvent)}
          className={styles.addButton}
        >
          <FiPlus className="mr-1.5 h-4 w-4" />
          Add Event
        </button>
      </div>

      {isAddingEvent && (
        <form onSubmit={handleAddEvent} className={styles.eventForm}>
          <div className={styles.formHeader}>
            <h4 className={styles.formTitle}>
              <FiPlus className="mr-2 h-4 w-4 text-blue-600" />
              New Event
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className={styles.closeButton}
              aria-label="Close"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Event title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={tempDate.start || formatForDateTimeLocal(newEvent.start)}
                    onChange={(e) => handleDateTimeChange('start', e.target.value)}
                    className="w-full px-2 py-1.5 pr-6 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <FiCalendar className="absolute right-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={tempDate.end || formatForDateTimeLocal(newEvent.end)}
                    onChange={(e) => handleDateTimeChange('end', e.target.value)}
                    className="w-full px-2 py-1.5 pr-6 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={formatForDateTimeLocal(newEvent.start)}
                    required
                  />
                  <FiClock className="absolute right-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDateTime()) {
                      toast.success('Date/Time confirmed');
                    }
                  }}
                  className="flex-1 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {tempDate.start || tempDate.end ? 'Confirm' : 'Update'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save Event
                </button>
              </div>
              <div className="text-[11px] text-gray-500 text-center">
                {format(newEvent.start, 'MMM d, h:mm a')} - {format(newEvent.end, 'h:mm a')}
              </div>
            </div>
            <select
              name="type"
              value={newEvent.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="call">Call</option>
              <option value="reminder">Reminder</option>
            </select>
            <div>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Add description (optional)"
                rows="2"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </form>
      )}

      <div className={styles.eventList}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>
              <FiCalendar className={styles.loadingIcon} />
            </div>
            <p className={styles.loadingText}>Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div>
            {events.map((event, index) => (
              <div 
                key={event._id} 
                className={`${styles.eventItem} ${getEventTypeStyle(event.type)}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <div className={styles.eventTitleContainer}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      {getEventTypeBadge(event.type)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event._id);
                      }}
                      className={styles.deleteButton}
                      title="Delete event"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className={styles.eventTime}>
                    <FiCalendar className={styles.eventTimeIcon} />
                    <span className="font-medium">
                      {format(event.start, 'MMM d, yyyy')}
                    </span>
                    <span className={styles.timeSeparator}>•</span>
                    <FiClock className={styles.eventTimeIcon} />
                    <span>
                      {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                    </span>
                  </div>
                  {event.description && (
                    <p className={styles.eventDescription}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <div className={styles.emptyIconCircle}>
                <FiCalendar className={styles.emptyIconInner} />
              </div>
              <div className={styles.emptyBadge}>
                <FiPlus className={styles.emptyBadgeIcon} />
              </div>
            </div>
            <h4 className={styles.emptyTitle}>No events scheduled</h4>
            <p className={styles.emptyText}>You don't have any upcoming events. Add your first event to get started!</p>
            <button
              onClick={() => setIsAddingEvent(true)}
              className={styles.emptyButton}
            >
              Add your first event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
