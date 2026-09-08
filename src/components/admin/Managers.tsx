import React from 'react';
import { CrudManager, type FieldConfig } from './CrudManager';

// ============================================================
// Content managers — each wraps the generic CrudManager with a
// field config. Changes save straight to Firestore (live on site).
// ============================================================

const FALLBACK_IMG = 'https://via.placeholder.com/800x500/18181b/e4e4e7?text=Upload+Image';

export const CoachesTab: React.FC = () => {
  const fields: FieldConfig[] = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'COACH NAME' },
    { key: 'role', label: 'Role / Title', type: 'text', placeholder: 'HEAD BOXING COACH' },
    { key: 'recordBadge', label: 'Record Badge', type: 'text', help: 'Optional — e.g. 22-1 (18 KOs)' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'image', label: 'Coach Photo', type: 'image' },
    { key: 'socials', label: 'Social Links', type: 'socials' },
    { key: 'specialties', label: 'Specialties', type: 'tags' },
  ];
  return (
    <CrudManager
      title="Coaches"
      description="Add, edit or delete coaches. Photos upload to Firebase Storage."
      collection="coaches"
      fields={fields}
      listKeys={['name', 'role']}
      listImageKey="image"
      newItem={() => ({ name: '', role: '', recordBadge: '', bio: '', image: FALLBACK_IMG, specialties: [], socials: {} })}
    />
  );
};

export const ProgramsTab: React.FC = () => {
  const fields: FieldConfig[] = [
    { key: 'title', label: 'Program Title', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Boxing', 'Hyrox', 'Strength', 'Cardio'] },
    { key: 'level', label: 'Level', type: 'text', placeholder: 'BEGINNER / ADVANCED' },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: '12 Weeks' },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'period', label: 'Billing Period', type: 'text', placeholder: '/mo' },
    { key: 'badge', label: 'Badge (optional)', type: 'text', help: 'e.g. MOST POPULAR' },
    { key: 'popular', label: 'Mark as Popular', type: 'bool' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'image', label: 'Program Image', type: 'image' },
    { key: 'features', label: 'Features', type: 'tags' },
  ];
  return (
    <CrudManager
      title="Training Programs"
      description="Add / edit / delete training programs."
      collection="programs"
      fields={fields}
      listKeys={['title', 'category']}
      listImageKey="image"
      newItem={() => ({ title: '', category: 'Boxing', level: 'ALL LEVELS', duration: '', price: 0, period: '/mo', badge: '', popular: false, description: '', image: FALLBACK_IMG, features: [] })}
    />
  );
};

export const ScheduleTab: React.FC = () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const colorTags = [
    'bg-rose-950 text-rose-400 border-rose-700',
    'bg-amber-950 text-amber-400 border-amber-700',
    'bg-cyan-950 text-cyan-400 border-cyan-700',
    'bg-purple-950 text-purple-400 border-purple-700',
    'bg-emerald-950 text-emerald-400 border-emerald-700',
    'bg-blue-950 text-blue-400 border-blue-700',
  ];
  const fields: FieldConfig[] = [
    { key: 'title', label: 'Class Title', type: 'text' },
    { key: 'serviceType', label: 'Discipline', type: 'select', options: ['Boxing', 'Hyrox', 'Strength', 'Cardio'] },
    { key: 'day', label: 'Day', type: 'select', options: days },
    { key: 'time', label: 'Time', type: 'text', placeholder: '6:00 AM' },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: '60 min' },
    { key: 'coachName', label: 'Coach', type: 'text', placeholder: 'Rivera' },
    { key: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Youth 8-16'] },
    { key: 'colorTag', label: 'Color Tag', type: 'select', options: colorTags },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'spotsLeft', label: 'Spots Left', type: 'number' },
    { key: 'price', label: 'Session Price', type: 'number' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'order', label: 'Display Order', type: 'number', help: 'Lower = earlier' },
  ];
  return (
    <CrudManager
      title="Weekly Schedule"
      description="Add / edit / delete class sessions."
      collection="schedule"
      fields={fields}
      listKeys={['title', 'day']}
      newItem={() => ({ title: '', serviceType: 'Boxing', day: 'MON', time: '6:00 AM', duration: '60 min', coachName: '', level: 'All Levels', colorTag: colorTags[0], capacity: 15, spotsLeft: 15, price: 25, description: '', order: 1 })}
    />
  );
};

export const PlansTab: React.FC = () => {
  const fields: FieldConfig[] = [
    { key: 'name', label: 'Plan Name', type: 'text', placeholder: 'Monthly' },
    { key: 'tagline', label: 'Tagline', type: 'text' },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'currency', label: 'Currency Symbol', type: 'text', placeholder: '₹' },
    { key: 'period', label: 'Billing Period', type: 'text', placeholder: '/month' },
    { key: 'badge', label: 'Badge (optional)', type: 'text', placeholder: 'BEST VALUE' },
    { key: 'popular', label: 'Mark as Popular', type: 'bool' },
    { key: 'features', label: 'Features', type: 'tags' },
  ];
  return (
    <CrudManager
      title="Membership Plans"
      description="Edit plan names, prices and features."
      collection="membershipPlans"
      fields={fields}
      listKeys={['name', 'tagline']}
      newItem={() => ({ name: '', tagline: '', price: 0, currency: '₹', period: '/month', badge: '', popular: false, features: [] })}
    />
  );
};

export const TestimonialsTab: React.FC = () => {
  const fields: FieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'CARLOS MENDEZ, 28' },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'memberDuration', label: 'Member Duration', type: 'text', placeholder: 'Member for 8 months' },
    { key: 'quote', label: 'Testimonial', type: 'textarea' },
    { key: 'resultBadge', label: 'Result Badge', type: 'text', placeholder: 'AMATEUR CHAMPION' },
    { key: 'resultText', label: 'Result Text', type: 'text', placeholder: 'Lost 42 lbs.' },
    { key: 'avatar', label: 'Avatar Photo', type: 'image' },
    { key: 'rating', label: 'Rating (1–5)', type: 'number' },
    { key: 'order', label: 'Display Order', type: 'number' },
  ];
  return (
    <CrudManager
      title="Testimonials"
      description="Add / edit / delete success stories."
      collection="testimonials"
      fields={fields}
      listKeys={['name', 'resultBadge']}
      listImageKey="avatar"
      newItem={() => ({ name: '', age: 30, memberDuration: '', quote: '', resultBadge: '', resultText: '', avatar: FALLBACK_IMG, rating: 5, order: 1 })}
    />
  );
};

export const GalleryTab: React.FC = () => {
  const fields: FieldConfig[] = [
    { key: 'title', label: 'Image Title', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Training', 'Sparring', 'Hyrox', 'Competition', 'Coaches', 'Gym'] },
    { key: 'image', label: 'Photo', type: 'image' },
    { key: 'order', label: 'Display Order', type: 'number' },
  ];
  return (
    <CrudManager
      title="Gallery"
      description="Upload gym / training photos to Firebase Storage."
      collection="gallery"
      fields={fields}
      listKeys={['title', 'category']}
      listImageKey="image"
      newItem={() => ({ title: '', category: 'Training', image: FALLBACK_IMG, order: 1 })}
    />
  );
};

export const EventsTab: React.FC = () => {
  const fields: FieldConfig[] = [
    { key: 'title', label: 'Event Title', type: 'text' },
    { key: 'type', label: 'Type', type: 'text', placeholder: 'FIGHT NIGHT / WORKSHOP' },
    { key: 'dateMonth', label: 'Month (3 letters)', type: 'text', placeholder: 'JUL' },
    { key: 'dateDay', label: 'Day', type: 'text', placeholder: '12' },
    { key: 'time', label: 'Time', type: 'text', placeholder: '7:00 PM' },
    { key: 'price', label: 'Ticket Price', type: 'number' },
    { key: 'priceLabel', label: 'Price Label', type: 'text', placeholder: '₹2,999 / ticket' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'capacityText', label: 'Capacity Text', type: 'text', placeholder: 'Limited to 200 spectators' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'image', label: 'Event Image', type: 'image' },
    { key: 'order', label: 'Display Order', type: 'number' },
  ];
  return (
    <CrudManager
      title="Events"
      description="Add / edit / delete upcoming events."
      collection="events"
      fields={fields}
      listKeys={['title', 'dateMonth']}
      listImageKey="image"
      newItem={() => ({ title: '', type: 'WORKSHOP', dateMonth: 'JUL', dateDay: '01', time: '7:00 PM', price: 0, priceLabel: 'Free', location: '', capacityText: '', description: '', image: FALLBACK_IMG, order: 1 })}
    />
  );
};