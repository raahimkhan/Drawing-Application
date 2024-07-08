import './styles/App.css';
import Title from './components/Title';
import CanvasContainer from './components/CanvasContainer';

const App = () => {

  return (
    <div className="top-most-container">
      <Title />
      <CanvasContainer />
    </div>
  );
}

export default App;