import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Answer } from '../types/Answer';
import { LoadingButton } from '@mui/lab';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Question } from '../types/Question';
import AdsClickIcon from '@mui/icons-material/AdsClick';

interface AnswerListProps {
  answers: Answer[];
  handleUpvote: (question: Question, answer: Answer) => Promise<void>;
  question: Question;
  answerDeadlinePassed: boolean;
  handleClaimReward: (question: Question, answer: Answer) => Promise<void>;
}

interface AnswerListItemProps {
  answer: Answer;
  handleUpvote: (question: Question, answer: Answer) => Promise<void>;
  question: Question;
  answerDeadlinePassed: boolean;
  handleClaimReward: (question: Question, answer: Answer) => Promise<void>;
}

const AnswerListItem = ({
  answer,
  handleUpvote,
  question,
  answerDeadlinePassed,
  handleClaimReward,
}: AnswerListItemProps) => {
  const replier = answer.isMine ? 'You' : answer.replier.substring(0, 8);
  const [upvoteLoading, setUpvoteLoading] = useState<boolean>(false);
  const [rewardLoading, setRewardLoading] = useState<boolean>(false);
  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemText
          sx={{ ml: 2, mr: 2 }}
          primary={answer.content}
          secondary={
            <React.Fragment>
              <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                {'Replier: ' + replier}
              </Typography>
              {` — ${answer.upvotes} upvotes`}
              <br />
              {`Claimed Token: ${answer.claimAmount}`}
            </React.Fragment>
          }
        />
      </ListItem>
      {!(answer.isMine || answerDeadlinePassed) && (
        <LoadingButton
          sx={{ ml: 4, width: 400, mb: 1 }}
          variant="outlined"
          color="secondary"
          onClick={() => {
            setUpvoteLoading(true);
            handleUpvote(question, answer);
            setUpvoteLoading(false);
          }}
          loading={upvoteLoading}
          disabled={answer.upvoted}
        >
          <ThumbUpIcon sx={{ mr: 1 }} />
          {answer.upvoted ? 'You Already Upvoted' : 'Upvote this Answer'}
        </LoadingButton>
      )}
      {answer.isMine && answerDeadlinePassed && answer.upvotes > 0 && (
        <LoadingButton
          sx={{ ml: 4, width: 400, mb: 1 }}
          variant="outlined"
          color="secondary"
          onClick={() => {
            setRewardLoading(true);
            handleClaimReward(question, answer);
            setRewardLoading(false);
          }}
          loading={rewardLoading}
          disabled={answer.rewardClaimed}
        >
          <AdsClickIcon sx={{ mr: 1 }} />
          {answer.rewardClaimed ? 'You Already Claimed Reward' : 'Claim Reward'}
        </LoadingButton>
      )}
    </>
  );
};

const AnswerList = ({ answers, handleUpvote, question, answerDeadlinePassed, handleClaimReward }: AnswerListProps) => {
  return (
    <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
      {answers.map((answer, index) => (
        <React.Fragment key={index}>
          <AnswerListItem
            answer={answer}
            handleUpvote={handleUpvote}
            question={question}
            answerDeadlinePassed={answerDeadlinePassed}
            handleClaimReward={handleClaimReward}
          />
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

export default AnswerList;
