import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch, Link, Redirect, useLocation } from 'react-router-dom'
import CreateProfile from './components/CreateProfile'
import SignUpModal from './components/SignUpModal'
import SignInModal from './components/SignInModal'
import ProfileManagementModal from './components/ProfileManagementModal'
import AdminDashboard from './components/admin/AdminDashboard'
import GaragePage from './components/GaragePage'
import Builds from './pages/vehicle/Builds'
import { getCurrentUser, signOut } from './services/auth'
import type { AuthResponse } from './services/auth'

// Protected Route Component
const ProtectedRoute = ({ component: Component, user, ...rest }: any) => (
  <Route
    {...rest}
    render={props =>
      user ? (
        <Component {...props} user={user} />
      ) : (
        <Redirect to={{ pathname: "/", state: { from: props.location } }} />
      )
    }
  />
);

// Main App Component
const AppContent = () => {
  const [email, setEmail] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<AuthResponse['user'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation();

  const loadUser = async () => {
    try {
      console.log('Loading user...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (token) {
        const user = await getCurrentUser();
        console.log('User loaded:', user);
        setCurrentUser(user);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setCurrentUser(null)
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSignUp = (username: string, email: string, password: string) => {
    // Handle sign up logic here
    console.log('Sign up:', { username, email, password })
    setIsSignUpModalOpen(false)
    // TODO: Implement actual sign up logic and redirect to create profile
  }

  const handleSignIn = (email: string, password: string) => {
    // Handle sign in logic here
    console.log('Sign in:', { email, password })
    setIsSignInModalOpen(false)
    // TODO: Implement actual sign in logic
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // TODO: Implement search functionality
    console.log('Searching for:', e.target.value)
  }

  if (isLoading) {
    return <div>Loading...</div> // You might want to add a proper loading spinner
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600">ModSquad</Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/" 
                  className={`${location.pathname === '/' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>
                <Link 
                  to="/builds" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Builds
                </Link>
                <Link 
                  to="/community" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Community
                </Link>
                {currentUser && (
                  <Link 
                    to="/garage" 
                    className={`${location.pathname === '/garage' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Garage
                  </Link>
                )}
                {currentUser?.isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`${location.pathname === '/admin' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative mr-4">
                <div className="flex items-center">
                  <div className="relative rounded-md shadow-sm w-96">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search builds..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              {currentUser ? (
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setIsProfileModalOpen(true)}
                    >
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={currentUser.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.username}`}
                        alt={currentUser.username}
                      />
                    </button>
                    <button
                      type="button"
                      className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsSignUpModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Up
                </button>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className={`${location.pathname === '/' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Home
              </Link>
              <Link 
                to="/builds" 
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Builds
              </Link>
              <Link 
                to="/community" 
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Community
              </Link>
              {currentUser && (
                <Link 
                  to="/garage" 
                  className={`${location.pathname === '/garage' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Garage
                </Link>
              )}
              {currentUser?.isAdmin && (
                <Link 
                  to="/admin" 
                  className={`${location.pathname === '/admin' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Admin
                </Link>
              )}
              <div className="px-3">
                <div className="relative rounded-md shadow-sm w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search builds..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {currentUser ? (
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={currentUser.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.username}`}
                      alt={currentUser.username}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{currentUser.username}</div>
                    <div className="text-sm font-medium text-gray-500">{currentUser.email}</div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSignUpModalOpen(true)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-indigo-700 block text-center"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <Switch>
        <Route path="/create-profile" component={CreateProfile} />
        <Route path="/builds" component={Builds} />
        <ProtectedRoute
          path="/garage"
          component={GaragePage}
          user={currentUser}
        />
        <ProtectedRoute
          path="/admin"
          component={AdminDashboard}
          user={currentUser?.isAdmin ? currentUser : null}
        />
        <Route path="/" exact>
          <main className="flex-grow">
            {/* Hero Section */}
            <div className="relative w-full overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                  <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                    <div className="sm:text-center lg:text-left">
                      {currentUser ? (
                        <>
                          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Welcome back,</span>
                            <span className="block text-indigo-600">{currentUser.username}!</span>
                          </h1>
                          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                            Ready to continue your automotive journey? Check out the latest community builds or update your garage.
                          </p>
                          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                            <div className="rounded-md shadow">
                              <Link
                                to="/garage"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                              >
                                View Your Garage
                              </Link>
                            </div>
                            <div className="mt-3 sm:mt-0 sm:ml-3">
                              <Link
                                to="/builds"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                              >
                                Explore Builds
                              </Link>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Your Car,</span>
                            <span className="block text-indigo-600">Your Community</span>
                          </h1>
                          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                            Join the ultimate car enthusiast community. Share your builds, connect with fellow modders, and showcase your automotive passion.
                          </p>
                          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                            <div className="rounded-md shadow">
                              <button
                                onClick={() => setIsSignUpModalOpen(true)}
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                              >
                                Start Your Build
                              </button>
                            </div>
                            <div className="mt-3 sm:mt-0 sm:ml-3">
                              <Link
                                to="/builds"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                              >
                                Explore Builds
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </main>
                </div>
              </div>
            </div>

            {/* Feature Section - Only show for non-logged in users */}
            {!currentUser && (
              <div className="w-full py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="lg:text-center">
                    <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      Built for Car Enthusiasts
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                      Everything you need to document, share, and discover amazing car builds.
                    </p>
                  </div>

                  <div className="mt-10">
                    <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                      {[
                        {
                          title: 'Build Profiles',
                          description: 'Create detailed profiles for your vehicles with specs, mods, and photo galleries.',
                        },
                        {
                          title: 'Community Feed',
                          description: 'Share updates, like and comment on builds, and connect with fellow enthusiasts.',
                        },
                        {
                          title: 'Mod Directory',
                          description: 'Comprehensive database of parts and modifications with reviews and fitment info.',
                        },
                        {
                          title: 'Events & Meetups',
                          description: 'Find and organize car meets, shows, and track days in your area.',
                        },
                      ].map((feature) => (
                        <div key={feature.title} className="relative">
                          <dt>
                            <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                          </dt>
                          <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section - Only show for non-logged in users */}
            {!currentUser && (
              <div className="w-full bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                      Join the Community
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                      Stay updated with the latest builds and community events.
                    </p>
                  </div>
                  <div className="mt-12 max-w-lg mx-auto">
                    <form className="grid grid-cols-1 gap-y-6">
      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="you@example.com"
                          />
                        </div>
      </div>
                      <div>
                        <button
                          type="submit"
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Subscribe to Updates
        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </main>
        </Route>
      </Switch>

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSignInClick={() => {
          setIsSignUpModalOpen(false)
          setIsSignInModalOpen(true)
        }}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignUpClick={() => {
          setIsSignInModalOpen(false)
          setIsSignUpModalOpen(true)
        }}
      />

      {currentUser && (
        <ProfileManagementModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onProfileUpdate={loadUser}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-2xl font-bold text-white">ModSquad</span>
              <p className="text-gray-300 text-sm">
                The ultimate platform for car enthusiasts and builders.
        </p>
      </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                <li><Link to="/builds" className="text-gray-300 hover:text-white text-sm">Featured Builds</Link></li>
                <li><Link to="/events" className="text-gray-300 hover:text-white text-sm">Events</Link></li>
                <li><Link to="/forum" className="text-gray-300 hover:text-white text-sm">Forum</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/parts" className="text-gray-300 hover:text-white text-sm">Parts Database</Link></li>
                <li><Link to="/guides" className="text-gray-300 hover:text-white text-sm">Build Guides</Link></li>
                <li><Link to="/support" className="text-gray-300 hover:text-white text-sm">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-300 hover:text-white text-sm">Privacy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white text-sm">Terms</Link></li>
                <li><Link to="/cookies" className="text-gray-300 hover:text-white text-sm">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} ModSquad. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Root component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
