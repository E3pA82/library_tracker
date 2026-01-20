// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Register from './pages/Register';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import Goals from './pages/Goals';
import NewGoal from './pages/NewGoal';
import ReadingLists from './pages/ReadingLists';
import ListDetail from './pages/ListDetail';
import NewList from './pages/NewList';
import Profile from './pages/Profile';
import ReadingHistory from './pages/ReadingHistory';
import Authors from './pages/Authors';
import Catalog from './pages/Catalog';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Route protégée */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/library"
              element={
                <PrivateRoute>
                  <Library />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-book"
              element={
                <PrivateRoute>
                  <AddBook />
                </PrivateRoute>
              }
            />
            <Route
              path="/library/:id"
              element={
                <PrivateRoute>
                  <BookDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <PrivateRoute>
                  <Goals />
                </PrivateRoute>
              }
            />
            <Route
              path="/goals/new"
              element={
                <PrivateRoute>
                  <NewGoal />
                </PrivateRoute>
              }
            />
            <Route
              path="/lists"
              element={
                <PrivateRoute>
                  <ReadingLists />
                </PrivateRoute>
              }
            />
            <Route
              path="/lists/:id"
              element={
                <PrivateRoute>
                  <ListDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/lists/new"
              element={
                <PrivateRoute>
                  <NewList />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/reading-history"
              element={
                <PrivateRoute>
                  <ReadingHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/authors"
              element={
                <PrivateRoute>
                  <Authors />
                </PrivateRoute>
              }
            />

            <Route
              path="/books"
              element={
                <PrivateRoute>
                  <Catalog />
                </PrivateRoute>
              }
            />
           {/* Route par défaut si l'URL ne correspond à rien */}
          <Route
            path="*"
            element={
              <div style={{ padding: 20 }}>
                <h1>404 - Page non trouvée</h1>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;