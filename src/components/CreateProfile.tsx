import { useState } from 'react'
import { Link } from 'react-router-dom'

interface CarDetails {
  make: string
  model: string
  year: string
  modifications: string[]
}

const CreateProfile = () => {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    location: '',
    experience: 'beginner', // beginner, intermediate, expert
    interests: [] as string[],
    instagram: '',
    youtube: ''
  })

  const [cars, setCars] = useState<CarDetails[]>([{
    make: '',
    model: '',
    year: '',
    modifications: []
  }])

  const [newModification, setNewModification] = useState('')

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCarChange = (index: number, field: keyof CarDetails, value: string) => {
    const newCars = [...cars]
    if (field !== 'modifications') {
      newCars[index] = {
        ...newCars[index],
        [field]: value
      }
      setCars(newCars)
    }
  }

  const addModification = (carIndex: number) => {
    if (newModification.trim()) {
      const newCars = [...cars]
      newCars[carIndex].modifications.push(newModification.trim())
      setCars(newCars)
      setNewModification('')
    }
  }

  const removeModification = (carIndex: number, modIndex: number) => {
    const newCars = [...cars]
    newCars[carIndex].modifications.splice(modIndex, 1)
    setCars(newCars)
  }

  const addCar = () => {
    setCars(prev => [...prev, {
      make: '',
      model: '',
      year: '',
      modifications: []
    }])
  }

  const removeCar = (index: number) => {
    setCars(cars.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Profile:', profile)
    console.log('Cars:', cars)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's get to know you and your rides
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={profile.username}
                          onChange={handleProfileChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="bio"
                          id="bio"
                          rows={3}
                          value={profile.bio}
                          onChange={handleProfileChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Tell us about yourself and your passion for cars..."
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={profile.location}
                          onChange={handleProfileChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                        Experience Level
                      </label>
                      <div className="mt-1">
                        <select
                          name="experience"
                          id="experience"
                          value={profile.experience}
                          onChange={handleProfileChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                        Instagram Handle (optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="instagram"
                          id="instagram"
                          value={profile.instagram}
                          onChange={handleProfileChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
                        YouTube Channel (optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="youtube"
                          id="youtube"
                          value={profile.youtube}
                          onChange={handleProfileChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Channel URL"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Your Rides</h3>
                    
                    {cars.map((car, carIndex) => (
                      <div key={carIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-medium text-gray-900">Car #{carIndex + 1}</h4>
                          {cars.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCar(carIndex)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove Car
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Make</label>
                            <input
                              type="text"
                              value={car.make}
                              onChange={(e) => handleCarChange(carIndex, 'make', e.target.value)}
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <input
                              type="text"
                              value={car.model}
                              onChange={(e) => handleCarChange(carIndex, 'model', e.target.value)}
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <input
                              type="text"
                              value={car.year}
                              onChange={(e) => handleCarChange(carIndex, 'year', e.target.value)}
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Modifications</label>
                          <div className="mt-1 flex space-x-2">
                            <input
                              type="text"
                              value={newModification}
                              onChange={(e) => setNewModification(e.target.value)}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="Add a modification"
                            />
                            <button
                              type="button"
                              onClick={() => addModification(carIndex)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Add
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {car.modifications.map((mod, modIndex) => (
                              <span
                                key={modIndex}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {mod}
                                <button
                                  type="button"
                                  onClick={() => removeModification(carIndex, modIndex)}
                                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addCar}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Another Car
                    </button>
                  </div>
                )}

                <div className="flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Previous
                    </button>
                  )}
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Profile
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProfile 