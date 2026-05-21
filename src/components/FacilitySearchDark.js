import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, CheckCircle } from 'lucide-react';
import { facilities as allFacilities } from '../data/facilities';

function FacilitySearch() {
  const { state, dispatch } = useHealth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [filters, setFilters] = useState({
    type: 'all',
    distance: 10,
    rating: 0,
    priceRange: 'all'
  });

  const [facilities, setFacilities] = useState(allFacilities);

  useEffect(() => {
    dispatch({ type: 'SET_FACILITIES', payload: facilities });
  }, [facilities, dispatch]);
  
  const isFromRecommendation = location.state?.searchQuery;
  
  useEffect(() => {
    if (isFromRecommendation) {
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [isFromRecommendation]);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filters.type === 'all' || facility.type.toLowerCase() === filters.type.toLowerCase();
    const matchesDistance = facility.distance <= filters.distance;
    const matchesRating = facility.rating >= filters.rating;
    
    return matchesSearch && matchesType && matchesDistance && matchesRating;
  });

  const bookAppointment = (facility) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentData = {
      id: Date.now(),
      appointmentId: Math.floor(100000 + Math.random() * 900000),
      facilityName: facility.name,
      date: tomorrow.toLocaleDateString('en-GB'),
      time: '10:00 AM',
      service: 'General Consultation',
      status: 'confirmed',
      name: 'Patient Name',
      phone: '+91 98765 43210',
      reason: 'General consultation and health checkup',
      doctorDetails: {
        name: 'Dr. ' + ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta'][Math.floor(Math.random() * 5)],
        specialty: facility.type === 'Hospital' ? 'General Medicine' : 'Family Medicine',
        experience: '10+ years experience',
        photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`
      }
    };
    
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointmentData });
    
    navigate('/appointment-confirmation', {
      state: { appointment: appointmentData }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isFromRecommendation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Recommended based on your medical report analysis
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                We've pre-filtered facilities that match your health needs.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Find Medical Facilities</h1>
      </div>

      <div className="relative overflow-hidden bg-white/60 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl shadow-xl p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search facilities or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner placeholder-gray-400"
            />
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner"
          >
            <option value="all">All Types</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="laboratory">Laboratory</option>
          </select>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Distance</label>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{filters.distance} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.distance}
              onChange={(e) => setFilters({...filters, distance: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Min Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
              className="w-full px-3 py-2.5 bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner text-sm"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      <div id="search-results" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="group relative bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">{facility.name}</h3>
                  <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mt-0.5">{facility.type}</p>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20 dark:border-cyan-500/20 rounded-full text-xs font-bold tracking-wide">
                  {facility.priceRange}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-300 col-span-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{facility.address} <span className="text-gray-400 mx-1">•</span> <span className="font-medium text-cyan-600 dark:text-cyan-400">{facility.distance} km away</span></span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{facility.rating}</span> <span className="text-gray-500 ml-1">rating</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-emerald-500" />
                  {facility.hours}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 col-span-2">
                  <Phone className="h-4 w-4 mr-2 text-blue-400" />
                  {facility.phone}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Available Services</h4>
                <div className="flex flex-wrap gap-2">
                  {facility.services.map((service, index) => (
                    <span key={index} className="px-2.5 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 rounded-lg text-xs font-medium">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Standard Pricing</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Consultation</div>
                    <div className="font-bold text-gray-900 dark:text-white">₹{facility.cost.consultation}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blood Test</div>
                    <div className="font-bold text-gray-900 dark:text-white">₹{facility.cost.bloodTest}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">X-Ray</div>
                    <div className="font-bold text-gray-900 dark:text-white">₹{facility.cost.xray}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => bookAppointment(facility)}
                className="w-full flex items-center justify-center font-bold text-white py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 transform active:scale-95"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No facilities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default FacilitySearch;