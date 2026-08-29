import { Request, Response } from 'express';
import { searchService } from '../services/searchService.js';

export const executeSearch = async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.q as string) || (req.body.query as string);

  if (!query || typeof query !== 'string') {
    res.status(400).json({ success: false, error: 'Search query parameter (q) is required' });
    return;
  }

  const result = await searchService.executeSearch(query);
  res.json({ success: true, data: result });
};
