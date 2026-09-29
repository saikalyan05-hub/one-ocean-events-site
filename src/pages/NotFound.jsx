import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Decor from '../components/Hero/Decor';
import './pages.css';
import './Static.css';

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" />
        <div className="container page-hero-inner notfound">
          <p className="notfound-code" aria-hidden="true">
            404
          </p>
          <h1 className="page-title">
            This page took the <span className="accent">day off</span>
          </h1>
          <p className="page-lede">
            The link may be old, or the page may never have existed. Either way, here is the way
            back.
          </p>
          <div className="notfound-actions">
            <Link to="/" className="btn btn-primary">
              <Icon name="arrowLeft" size={17} /> Back home
            </Link>
            <Link to="/vendors" className="btn btn-secondary">
              Browse vendors
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
