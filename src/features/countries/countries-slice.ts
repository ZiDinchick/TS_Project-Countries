import { createAsyncThunk, createSlice, isRejectedWithValue } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { Country, Extra, Status } from 'types/index';

export const loadCountries = createAsyncThunk<
  {
    data: Country[],
  },
  undefined,
  {
    state: { countries: countrySlice },
    extra: Extra,
    rejectValue: string,
  }>(
    '@@countries/load-countries',
    async (_, {
      extra: { client, api },
      rejectWithValue,
    }) => {
      try {
        return client.get(api.ALL_COUNTRIES)
      } catch (error) {
        if (error instanceof Error)
          return rejectWithValue(error.message);
        return rejectWithValue('Unknown error')
      }
    },
    {
      condition: (_, { getState }) => {
        const { countries: { status } } = getState();

        if (status === 'loading') {
          return false;
        }
      }
    }
  );

type countrySlice = {
  status: Status,
  error: string | null,
  list: Country[],
}

const initialState: countrySlice = {
  status: 'idle',
  error: null,
  list: [],
}

const countrySlice = createSlice({
  name: '@@countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCountries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCountries.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.payload || 'Cannot load data';
      })
      .addCase(loadCountries.fulfilled, (state, action) => {
        state.status = 'received';
        state.list = action.payload.data;
      })
  }
})

export const countryReducer = countrySlice.reducer;
