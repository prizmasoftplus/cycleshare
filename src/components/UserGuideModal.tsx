import React from 'react';
import { X, MapPin, Star, Navigation, PenSquare, Filter, Car, RefreshCw, Search, Plus, Tags, Clock } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">TfL Cycle Share Map - User Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Overview</h3>
            <p className="text-gray-700 leading-relaxed">
              This interactive map shows real-time data for London's TfL Cycle Share stations (Santander Bikes). 
              View bike availability, plan routes, save favorites, and track station status with powerful filtering tools.
            </p>
          </section>

          {/* Map Features */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Map Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Station Markers
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>🟢 <strong>Green:</strong> Good availability (≥30% bikes & docks)</li>
                  <li>🔵 <strong>Blue:</strong> Low availability (≥10% bikes & docks)</li>
                  <li>🔴 <strong>Red:</strong> Full stations or offline</li>
                  <li>⚫ <strong>Black:</strong> Empty stations</li>
                  <li>🟣 <strong>Purple border:</strong> E-bike stations</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Station Information</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Number shows available bikes</li>
                  <li>• Click any station for detailed info</li>
                  <li>• View location photos</li>
                  <li>• Real-time availability data</li>
                  <li>• Auto-refresh every 30 seconds</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Search & Filtering */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Search & Filtering</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Search className="w-4 h-4 mr-2 text-red-500" />
                  Search Stations
                </h4>
                <p className="text-sm text-gray-700">
                  Type station names or IDs in the search box. Auto-suggestions appear as you type.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-blue-600" />
                  Status Filters
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <strong>Full Stations:</strong>
                    <ul className="ml-4 space-y-1">
                      <li>• Full - Completely full</li>
                      <li>• 75% Full - ≤25% docks available</li>
                      <li>• 50% Full - ≤50% docks available</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Empty Stations:</strong>
                    <ul className="ml-4 space-y-1">
                      <li>• Empty - No bikes available</li>
                      <li>• 75% Empty - ≤25% bikes available</li>
                      <li>• 50% Empty - ≤50% bikes available</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Set time duration (30min, 60min, or custom) to filter stations that have been in this state consistently.
                </p>
              </div>
            </div>
          </section>

          {/* Station Management */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Station Management</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-amber-500" />
                  Favorites
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Click star icon in station popup</li>
                  <li>• Favorites show star on map</li>
                  <li>• Saved automatically in browser</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Priority Levels</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>🟣 <strong>HP:</strong> High Priority</li>
                  <li>🔴 <strong>P1:</strong> Priority 1</li>
                  <li>🔵 <strong>P2:</strong> Priority 2</li>
                  <li>🟤 <strong>P3:</strong> Priority 3</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">Set in station popup dropdown</p>
              </div>
            </div>
          </section>

          {/* Directions & Navigation */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Directions & Navigation</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-blue-600" />
                Getting Directions
              </h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Click "Get Directions From Here" in any station popup</li>
                <li>Click another station to set as destination</li>
                <li>View route and travel time at bottom of screen</li>
                <li>Click X to clear directions</li>
              </ol>
            </div>
          </section>

          {/* Custom Stations */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom Stations</h3>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Plus className="w-4 h-4 mr-2 text-blue-600" />
                  Adding Custom Stations
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Click + button in top controls</li>
                  <li>• Add single station or multiple at once</li>
                  <li>• Choose colors and labels</li>
                  <li>• Coordinates auto-detected from names</li>
                </ul>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Tags className="w-4 h-4 mr-2 text-teal-600" />
                  Custom Station Filtering
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Use tags button to filter by labels</li>
                  <li>• "Hide TfL Stations" shows only custom</li>
                  <li>• Select specific tags to show</li>
                  <li>• Clear selection to show all</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Area Drawing */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Area Management</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <PenSquare className="w-4 h-4 mr-2 text-gray-600" />
                Drawing & Managing Areas
              </h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Click drawing tool (pen icon) in top controls</li>
                <li>Click on map to draw polygon points</li>
                <li>Complete polygon and name your area</li>
                <li>Toggle areas on/off with checkboxes</li>
                <li>Delete areas with trash icon</li>
              </ol>
            </div>
          </section>

          {/* Additional Features */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Car className="w-4 h-4 mr-2 text-green-600" />
                  Traffic Layer
                </h4>
                <p className="text-sm text-gray-700">
                  Toggle traffic information overlay to see current road conditions.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 text-blue-600" />
                  Data Refresh
                </h4>
                <p className="text-sm text-gray-700">
                  Data updates automatically every 30 seconds. Click refresh button for manual update.
                </p>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tips & Shortcuts</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Escape key:</strong> Close any open modal</li>
                <li>• <strong>Station photos:</strong> Click image to open Street View</li>
                <li>• <strong>Interactive Street View:</strong> Use "Interactive View" button</li>
                <li>• <strong>Data persistence:</strong> All settings saved in browser</li>
                <li>• <strong>Mobile friendly:</strong> Responsive design for all devices</li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✅ No cookies used - only localStorage</li>
                <li>✅ All data stays in your browser</li>
                <li>✅ No personal data collection</li>
                <li>✅ No tracking or analytics</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Close User Guide
          </button>
        </div>
      </div>
    </div>
  );
};