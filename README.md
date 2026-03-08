# JouleBuddy

A smart energy management mobile app prototype developed for SP Group. JouleBuddy helps users monitor their household energy consumption, classify appliances using machine learning, earn GreenPoints for sustainable actions, and manage electricity bills seamlessly.

## Features

- **Energy Monitoring**: Real-time tracking of household energy usage with breakdowns by appliance category (Cooling, Laundry, Kitchen, Baseload)
- **Appliance Classification**: AI-powered classification of appliances using a trained machine learning model
- **GreenPoints System**: Earn points through eco-friendly challenges and maintain streaks for bonuses
- **Bill Management**: View and pay electricity bills directly through the app
- **EV Integration**: Support for electric vehicle energy management
- **JouleBuddy AI Assistant**: Intelligent assistant for energy-related queries and recommendations
- **Photo Verification**: Submit photos to verify completed eco-quests

## Tech Stack

### Frontend
- **React Native** with **Expo**
- **Navigation**: React Navigation (Bottom Tabs & Native Stack)
- **UI Components**: React Native Paper, Expo Vector Icons, Lucide React Native
- **Charts**: React Native Chart Kit with SVG support
- **Storage**: AsyncStorage for local data persistence
- **HTTP Client**: Axios for API communication

### Backend
- **FastAPI** (Python web framework)
- **Machine Learning**: Scikit-learn with Joblib for model serialization
- **Database**: ClickHouse Cloud for energy data storage
- **AI Integration**: Google Generative AI
- **CORS**: Configured for cross-origin requests from mobile app

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

## Installation

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd jobless-quintet-sp-group
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - **Android**: `npm run android`
   - **iOS**: `npm run ios`
   - **Web**: `npm run web`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add your ClickHouse Cloud credentials:
     ```
     CLICKHOUSE_HOST=your-clickhouse-host
     CLICKHOUSE_PORT=443
     CLICKHOUSE_USER=your-username
     CLICKHOUSE_PASSWORD=your-password
     ```

5. Ensure the trained model file `trained_appliance_classifier.joblib` is in the `backend` directory

6. Start the FastAPI server:
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

## Usage

1. Launch the app using Expo Go on your mobile device or run it in a simulator
2. Navigate through the app using the bottom tab bar:
   - **Home**: View energy consumption charts and breakdowns
   - **Bills**: Check and pay electricity bills
   - **EV**: Manage electric vehicle charging
   - **JouleBuddy**: Interact with the AI assistant
   - **Profile**: View GreenPoints, settings, and legal information

3. Complete eco-quests by submitting photos to earn GreenPoints
4. Monitor your energy usage patterns and receive personalized recommendations

## API Endpoints

The backend provides the following main endpoints:

- `GET /api/energy?period={daily|weekly|monthly}`: Get energy consumption data with appliance breakdown
- Additional endpoints for bill management, user data, and AI interactions

## Project Structure

```

```
jobless-quintet-sp-group/
├── App.js                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Frontend dependencies and scripts
├── babel.config.js        # Babel configuration
├── index.js