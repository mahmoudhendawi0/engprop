import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetailReference';
import CompareProperties from './pages/CompareProperties';
import Agencies from './pages/Agencies';
import AgencyProfile from './pages/AgencyProfile';
import Favorites from './pages/Favorites';
import OfficeDashboard from './pages/OfficeDashboard';
import AddProperty from './pages/AddProperty';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import InteractiveMap from './components/map/InteractiveMap';
import AuthModal from './components/auth/AuthModal';
import { agencies as fallbackAgencies, properties as fallbackProperties } from './data/propertiesData';
import { clearToken, createProperty, getCurrentUser, getFavorites, getProperties, setFavorite } from './services/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-red-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900">حدث خطأ أثناء عرض هذا المحتوى</h2>
          <p className="text-xs text-slate-500">{this.state.error?.message || 'يرجى إعادة المحاولة'}</p>
          <button 
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [comparedProperties, setComparedProperties] = useState([]);
  const [filterQuery, setFilterQuery] = useState({ purpose: 'الكل', city: 'الكل', search: '' });
  const [toastMessage, setToastMessage] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [propertyList, setPropertyList] = useState(fallbackProperties);
  const canManageOffice = currentUser?.role === 'office' || currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'admin';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canAccessPage = (page) => {
    if (page === 'office-dashboard' || page === 'add-property') return canManageOffice;
    if (page === 'admin-dashboard' || page === 'super-admin') return isSuperAdmin;
    return true;
  };

  const navigateToPage = (page) => {
    if (!canAccessPage(page)) {
      showToast('هذه الصفحة مخصصة لنوع حساب آخر');
      return;
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    };

    const initializeProperties = async () => {
      try {
        const response = await getProperties();
        if (response.length > 0) {
          setPropertyList(response);
        } else {
          setPropertyList(fallbackProperties);
        }
      } catch {
        setPropertyList(fallbackProperties);
      }
    };

    initializeUser();
    initializeProperties();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    getFavorites()
      .then(response => setFavorites(response.items || []))
      .catch(() => showToast('تعذر تحميل المفضلة من الخادم'));
  }, [currentUser]);

  const handleToggleFavorite = (propertyId) => {
    const nextEnabled = !favorites.includes(propertyId);
    setFavorites(prev => {
      const exists = prev.includes(propertyId);
      if (exists) {
        showToast('تمت إزالة العقار من المفضلة');
        return prev.filter(id => id !== propertyId);
      } else {
        showToast('تمت إضافة العقار إلى المفضلة ❤️');
        return [...prev, propertyId];
      }
    });
    if (currentUser) {
      setFavorite(propertyId, nextEnabled).catch(() => {
        setFavorites(prev => nextEnabled ? prev.filter(id => id !== propertyId) : [...prev, propertyId]);
        showToast('تعذر حفظ المفضلة');
      });
    }
  };

  const handleToggleCompare = (property) => {
    setComparedProperties(prev => {
      const exists = prev.some(p => p.id === property.id);
      if (exists) {
        showToast('تمت إزالة العقار من قائمة المقارنة');
        return prev.filter(p => p.id !== property.id);
      } else {
        if (prev.length >= 4) {
          showToast('يمكنك مقارنة 4 عقارات كحد أقصى في وقت واحد');
          return prev;
        }
        showToast('تمت إضافة العقار للمقارنة');
        return [...prev, property];
      }
    });
  };

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setActivePage('property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAgency = (agency) => {
    const fullAgency = fallbackAgencies.find((item) => item.id === agency?.id || item.name === agency?.name);
    setSelectedAgency(fullAgency || agency);
    setActivePage('agency-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAgencyProperties = (agency) => {
    setFilterQuery({ purpose: 'الكل', city: agency.city.split(' ')[0], search: agency.name });
    setActivePage('properties');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Cairo',sans-serif]">
      
      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={navigateToPage}
        favoritesCount={favorites.length}
        compareList={comparedProperties}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        user={currentUser}
        onLogout={() => {
          clearToken();
          setCurrentUser(null);
          setFavorites([]);
          showToast('تم تسجيل الخروج بنجاح');
        }}
      />

      {/* Main Pages Content View */}
      <ErrorBoundary>
        <main className="flex-1">
          {activePage === 'home' && (
            <Home
              onSelectProperty={handleSelectProperty}
              setActivePage={setActivePage}
              setFilterQuery={setFilterQuery}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              comparedProperties={comparedProperties}
              onToggleCompare={handleToggleCompare}
              propertyList={propertyList}
            />
          )}

          {activePage === 'properties' && (
            <Properties
              onSelectProperty={handleSelectProperty}
              initialFilters={filterQuery}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              comparedProperties={comparedProperties}
              onToggleCompare={handleToggleCompare}
              propertyList={propertyList}
            />
          )}

          {activePage === 'map' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-blue-600 block mb-1">الاستعراض الجغرافي</span>
                  <h1 className="text-2xl font-black text-slate-900">خريطة العقارات في سوريا</h1>
                  <p className="text-xs text-slate-500">انقر على أي مؤشر سعر على الخريطة لمعاينة العقار والانتقال لكافة تفاصيله</p>
                </div>
              </div>

              <InteractiveMap
                properties={propertyList}
                onSelectProperty={handleSelectProperty}
              />
            </div>
          )}

          {activePage === 'property-detail' && (
            selectedProperty ? (
              <PropertyDetail
                property={selectedProperty}
                onBack={() => setActivePage('properties')}
                onSelectProperty={handleSelectProperty}
                onSelectAgency={handleSelectAgency}
                onShowMap={() => navigateToPage('map')}
                isFavorite={favorites.includes(selectedProperty.id)}
                onToggleFavorite={handleToggleFavorite}
                propertyList={propertyList}
              />
            ) : (
              <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
                <p className="text-slate-600 font-bold">لم يتم اختيار أي عقار لعرضه</p>
                <button
                  onClick={() => setActivePage('properties')}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  استعراض كل العقارات
                </button>
              </div>
            )
          )}

        {activePage === 'compare' && (
          <CompareProperties
            comparedProperties={comparedProperties}
            onRemoveFromCompare={(id) => setComparedProperties(p => p.filter(x => x.id !== id))}
            onClearCompare={() => setComparedProperties([])}
            onSelectProperty={handleSelectProperty}
            onAddToCompare={handleToggleCompare}
            setActivePage={setActivePage}
            propertyList={propertyList}
          />
        )}

        {activePage === 'agencies' && (
          <Agencies
            onSelectAgencyProperties={handleSelectAgencyProperties}
            onSelectAgency={handleSelectAgency}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'agency-profile' && selectedAgency && (
          <AgencyProfile
            agency={selectedAgency}
            propertyList={propertyList}
            onBack={() => setActivePage('agencies')}
            onSelectProperty={handleSelectProperty}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            comparedProperties={comparedProperties}
            onToggleCompare={handleToggleCompare}
            onBrowseProperties={() => {
              handleSelectAgencyProperties(selectedAgency);
              setActivePage('properties');
            }}
          />
        )}

        {activePage === 'favorites' && (
          <Favorites
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={handleSelectProperty}
            setActivePage={setActivePage}
            comparedProperties={comparedProperties}
            onToggleCompare={handleToggleCompare}
            propertyList={propertyList}
          />
        )}

        {activePage === 'office-dashboard' && (
          <OfficeDashboard
            setActivePage={setActivePage}
            onSelectProperty={handleSelectProperty}
            isAdmin={isSuperAdmin}
          />
        )}

        {activePage === 'add-property' && (
          <AddProperty
            onAddPropertySuccess={async (newProp) => {
              try {
                const savedProperty = await createProperty(newProp);
                setPropertyList(current => [savedProperty, ...current]);
                showToast('تمت إضافة العقار الجديد بنجاح!');
                handleSelectProperty(savedProperty);
              } catch (error) {
                showToast(error.message || 'تعذر حفظ العقار');
                throw error;
              }
            }}
            onAddPropertiesSuccess={async (properties) => {
              const savedProperties = [];
              try {
                for (const property of properties) {
                  savedProperties.push(await createProperty(property));
                }
                setPropertyList((current) => [...savedProperties, ...current]);
                showToast(`تم استيراد ${savedProperties.length} عقار بنجاح`);
              } catch (error) {
                if (savedProperties.length) {
                  setPropertyList((current) => [...savedProperties, ...current]);
                  const partialError = new Error(`تم حفظ ${savedProperties.length} عقار قبل تعذر إكمال الاستيراد: ${error.message}`);
                  partialError.savedCount = savedProperties.length;
                  throw partialError;
                }
                throw error;
              }
            }}
            setActivePage={setActivePage}
          />
        )}

        {(activePage === 'admin-dashboard' || activePage === 'super-admin') && (
          <SuperAdminDashboard />
        )}
      </main>
      </ErrorBoundary>

      {/* Global Footer */}
      <Footer 
        setActivePage={setActivePage} 
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          const destination = user.role === 'admin'
            ? 'super-admin'
            : user.role === 'office'
              ? 'office-dashboard'
              : 'home';
          setActivePage(destination);
          showToast(
            user.role === 'admin'
              ? 'تم تسجيل الدخول كسوبر أدمن'
              : user.role === 'office'
                ? 'تم تسجيل الدخول كـ مكتب عقاري'
                : 'تم تسجيل الدخول كمستخدم عادي'
          );
        }}
      />

    </div>
  );
}

