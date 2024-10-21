import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WillGenerator from './WillGenerator';
import Signup from './Signup';
import Login from './Login';
import { supabase } from './supabaseClient';
const App = () => {
const [user, setUser] = useState(null);
useEffect(() => {
const fetchUser = async () => {
const { data: { user } } = await supabase.auth.getUser();
setUser(user);
 };
fetchUser();
 }, []);
return (
<Router>
<Routes>
<Route path="/" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/login" element={<Login />} />
<Route path="/form" element={user ? <WillGenerator /> : <Login />} />
</Routes>
</Router>
 );
 };
export default App;