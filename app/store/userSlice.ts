import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserWithWeather, WeatherResponse } from '@types';
import { fetchUsers, fetchWeather } from '@services/api';

interface UserState {
  users: UserWithWeather[];
  selectedUser: UserWithWeather | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Async thunk for loading users
export const loadUsers = createAsyncThunk(
  'user/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await fetchUsers();
      
      const usersWithWeather: UserWithWeather[] = await Promise.all(
        users.map(async (user, index) => {
          const userId: string = user.id || user.login?.uuid || user.login?.username || user.email || `user-${index}`;
          
          try {
            const latitude = parseFloat(user.location.coordinates.latitude);
            const longitude = parseFloat(user.location.coordinates.longitude);
            const weatherData = await fetchWeather(latitude, longitude);
            
            const userWithWeather: UserWithWeather = {
              id: userId,
              name: user.name,
              gender: user.gender,
              email: user.email,
              picture: user.picture,
              location: user.location,
              weather: {
                current: weatherData.current_weather,
                daily: weatherData.daily,
              },
            };
            
            return userWithWeather;
          } catch (error) {
            console.error(`Failed to fetch weather for user ${user.email}:`, error);
            const userWithWeather: UserWithWeather = {
              id: userId,
              name: user.name,
              gender: user.gender,
              email: user.email,
              picture: user.picture,
              location: user.location,
            };
            
            return userWithWeather;
          }
        })
      );
      
      return usersWithWeather;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load users'
      );
    }
  }
);

// Async thunk for loading user weather
export const loadUserWeather = createAsyncThunk(
  'user/loadUserWeather',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const user = state.user.users.find(u => u.id === userId);
      
      if (!user) {
        return rejectWithValue('User not found');
      }

      if (user.weather) {
        return { userId, user };
      }

      const latitude = parseFloat(user.location.coordinates.latitude);
      const longitude = parseFloat(user.location.coordinates.longitude);
      const weatherData = await fetchWeather(latitude, longitude, true);
      
      const updatedUser: UserWithWeather = {
        ...user,
        weather: {
          current: weatherData.current_weather,
          daily: weatherData.daily,
        },
      };
      
      return { userId, user: updatedUser };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load weather'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<string>) => {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        state.selectedUser = user;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUsers
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // loadUserWeather
      .addCase(loadUserWeather.fulfilled, (state, action) => {
        const { userId, user } = action.payload;
        state.users = state.users.map(u => 
          u.id === userId ? user : u
        );
        if (state.selectedUser?.id === userId) {
          state.selectedUser = user;
        }
      })
      .addCase(loadUserWeather.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { selectUser, clearError } = userSlice.actions;
export default userSlice.reducer;

