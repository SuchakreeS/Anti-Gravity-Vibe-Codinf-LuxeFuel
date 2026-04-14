import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import Layout from '../../components/Layout';
import { useCars } from '../../hooks/useCars';

import ProfileInfo from './ProfileInfo';
import ChangePassword from './ChangePassword';
import MyCars from './MyCars';

function Profile() {
  const { user, updateUser } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isOrgUser = useAuthStore((state) => state.isOrgUser);
  const isOrgMember = useAuthStore((state) => state.isOrgMember);
  const { 
    cars,
    orgCars,
    personalCars,
    setCars, 
    makes, 
    models, 
    loadingModels, 
    fetchMakes, 
    fetchModels 
  } = useCars(user);

  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({ name: '', brand: '', model: '', licensePlate: '', otherSpecs: '' });
  const [addingCar, setAddingCar] = useState(false);
  const [newCarForm, setNewCarForm] = useState({ name: '', brand: '', model: '', licensePlate: '', otherSpecs: '' });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [useOwnCar, setUseOwnCar] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
      setProfileForm({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (addingCar && makes.length === 0) {
      fetchMakes();
    }
  }, [addingCar, makes.length, fetchMakes]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', profileForm);
      setProfile(res.data);
      updateUser({ name: res.data.name, email: res.data.email });
      Swal.fire('Success', 'Profile updated!', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Swal.fire('Error', 'Passwords do not match', 'error');
    }
    try {
      await api.put('/users/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire('Success', 'Password changed successfully!', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  const openEditCar = (car) => {
    setEditingCar(car);
    setCarForm({ name: car.name, brand: car.brand, model: car.model, licensePlate: car.licensePlate || '', otherSpecs: car.otherSpecs || '' });
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/cars/${editingCar.id}`, carForm);
      setCars(cars.map(c => c.id === editingCar.id ? res.data : c));
      setEditingCar(null);
      Swal.fire('Success', 'Car updated!', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update car', 'error');
    }
  };

  const handleDeleteCar = async (carId) => {
    const confirm = await Swal.fire({
      title: 'Delete Car?',
      text: 'This will permanently delete the car and ALL its fuel records!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#ef4444'
    });
    if (confirm.isConfirmed) {
      try {
        await api.delete(`/cars/${carId}`);
        setCars(cars.filter(c => c.id !== carId));
        Swal.fire('Deleted!', 'Car and records removed.', 'success');
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to delete car', 'error');
      }
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const carData = { ...newCarForm };
      if (isAdmin()) {
        carData.isPersonal = useOwnCar;
      } else if (isOrgUser()) {
        carData.isPersonal = true;
      }
      const res = await api.post('/cars', carData);
      setCars([res.data, ...cars]);
      setNewCarForm({ name: '', brand: '', model: '', licensePlate: '', otherSpecs: '' });
      setAddingCar(false);
      setUseOwnCar(false);
      Swal.fire('Success', 'Car added!', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to add car', 'error');
    }
  };

  // Which cars to show in profile
  const displayCars = isOrgUser() ? personalCars : cars;
  const canAddCar = !isOrgUser() || true; // org users can add personal cars

  const roleBadge = {
    admin: { text: 'Organization Admin', class: 'badge-primary' },
    user: { text: 'Organization Member', class: 'badge-secondary' },
    individual: { text: 'Individual', class: 'badge-ghost' },
  };
  const badge = roleBadge[user?.role] || roleBadge.individual;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileInfo 
            handleUpdateProfile={handleUpdateProfile} 
            profileForm={profileForm} 
            setProfileForm={setProfileForm} 
            badge={badge} 
            profile={profile} 
          />
          <ChangePassword 
            handleChangePassword={handleChangePassword} 
            passwordForm={passwordForm} 
            setPasswordForm={setPasswordForm} 
          />
        </div>

        {/* My Cars */}
        <MyCars 
          isOrgUser={isOrgUser} 
          isAdmin={isAdmin} 
          isOrgMember={isOrgMember} 
          displayCars={displayCars} 
          canAddCar={canAddCar}
          addingCar={addingCar} 
          setAddingCar={setAddingCar}
          useOwnCar={useOwnCar} 
          setUseOwnCar={setUseOwnCar}
          handleAddCar={handleAddCar} 
          newCarForm={newCarForm} 
          setNewCarForm={setNewCarForm}
          isManualEntry={isManualEntry} 
          setIsManualEntry={setIsManualEntry}
          fetchModels={fetchModels} 
          makes={makes} 
          models={models} 
          loadingModels={loadingModels}
          editingCar={editingCar} 
          openEditCar={openEditCar} 
          handleUpdateCar={handleUpdateCar} 
          handleDeleteCar={handleDeleteCar}
          carForm={carForm} 
          setCarForm={setCarForm} 
        />
      </div>
    </Layout>
  );
}

export default Profile;
