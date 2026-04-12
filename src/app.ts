import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import methodOverride from 'method-override';
import indexRouter from './routes/index';
import photosRouter from './routes/photos';
import peopleRouter from './routes/people';
import apiRouter from './routes/api';
import { getInboxCount } from './services/photoService';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/processed', express.static(path.join(process.cwd(), 'data', 'processed')));

// Make inboxCount and path helpers available to all views
app.use((_req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals['inboxCount'] = getInboxCount();
  } catch {
    res.locals['inboxCount'] = 0;
  }
  res.locals['basename'] = path.basename;
  next();
});

app.use('/', indexRouter);
app.use('/photos', photosRouter);
app.use('/people', peopleRouter);
app.use('/api', apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send(`<pre>Error: ${err.message}</pre>`);
});

export default app;
