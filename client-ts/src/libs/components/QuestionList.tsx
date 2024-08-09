import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Question } from '../types/Question';

interface QuestionListProps {
  questions: Question[];
}

const QuestionListItem = ({ question }: { question: Question }) => {
  return (
    <ListItem alignItems="flex-start">
      <ListItemText
        primary={question.content}
        secondary={
          <React.Fragment>
            <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
              {question.asker}
            </Typography>
            {` — ${question.createdAt}`}
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

const QuestionList = ({ questions }: QuestionListProps) => {
  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {questions.map((question, index) => (
        <React.Fragment key={index}>
          <QuestionListItem question={question} />
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default QuestionList;
