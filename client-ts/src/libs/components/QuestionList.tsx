import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { Question } from '../types/Question';
import LaunchIcon from '@mui/icons-material/Launch';

interface QuestionListProps {
  questions: Question[];
  handleQuestionClick: (question: Question) => void;
}

interface QuestionListItemProps {
  question: Question;
  handleQuestionClick: (question: Question) => void;
}

const QuestionListItem = ({ question, handleQuestionClick }: QuestionListItemProps) => {
  const asker = question.isMine ? 'You' : question.asker.substring(0, 8);
  const shrinkedQuestion = question.content.length > 50 ? question.content.substring(0, 50) + '...' : question.content;
  return (
    <ListItem alignItems="flex-start">
      <ListItemButton
        onClick={() => {
          handleQuestionClick(question);
        }}
      >
        <LaunchIcon />
        <ListItemText
          sx={{ ml: 2 }}
          primary={shrinkedQuestion}
          secondary={
            <React.Fragment>
              <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                {'Asker: ' + asker}
              </Typography>
              {` — ${question.createdAt}`}
            </React.Fragment>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

const QuestionList = ({ questions, handleQuestionClick }: QuestionListProps) => {
  return (
    <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
      {questions.map((question, index) => (
        <React.Fragment key={index}>
          <QuestionListItem question={question} handleQuestionClick={handleQuestionClick} />
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default QuestionList;
