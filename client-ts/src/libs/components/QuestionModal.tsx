import React, { useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  Divider,
  Paper,
  InputBase,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Question } from '../types/Question';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AnswerList from './AnswerList';
import { Answer } from '../types/Answer';
import AdsClickIcon from '@mui/icons-material/AdsClick';

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  handleUpvote: (question: Question) => Promise<void>;
  handlePostAnswer: (question: Question, answer: string, claimAmount: number) => Promise<void>;
  handleUpvoteAnswer: (question: Question, answer: Answer) => Promise<void>;
  handleClaimRewardQuestion: (question: Question) => Promise<void>;
  handleClaimRewardAnswer: (question: Question, answer: Answer) => Promise<void>;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const QuestionModal = ({
  open,
  onClose,
  question,
  handleUpvote,
  handlePostAnswer,
  handleUpvoteAnswer,
  handleClaimRewardQuestion,
  handleClaimRewardAnswer,
}: QuestionModalProps) => {
  const [upvoteLoading, setUpvoteLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<number>(50);
  const [claimAmountError, setClaimAmountError] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [rewardLoading, setRewardLoading] = useState<boolean>(false);

  const handleClaimAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(e.target.value);
    if (amount < 50 || amount > 150) {
      setClaimAmountError(true);
    } else {
      setClaimAmountError(false);
      setClaimAmount(amount);
    }
  };

  const handleUpvoteQuestionWrapper = async (question: Question) => {
    setUpvoteLoading(true);
    await handleUpvote(question);
    setUpvoteLoading(false);
    onClose();
  };

  const handleUpvoteAnswerWrapper = async (question: Question, answer: Answer) => {
    await handleUpvoteAnswer(question, answer);
    onClose();
  };

  const handleClaimRewardQuestionWrapper = async (question: Question) => {
    setRewardLoading(true);
    await handleClaimRewardQuestion(question);
    setRewardLoading(false);
    onClose();
  };

  const handleClaimRewardWrapper = async (question: Question, answer: Answer) => {
    setRewardLoading(true);
    await handleClaimRewardAnswer(question, answer);
    setRewardLoading(false);
    onClose();
  };

  const asker = question?.isMine ? 'You' : question?.asker.substring(0, 8);
  const voteDeadlinePassed = question?.voteDeadline ? question?.voteDeadline < new Date(Date.now()) : true;
  const answerDeadlinePassed = question?.answerDeadline ? question?.answerDeadline < new Date(Date.now()) : true;
  const voteRewardClaimable = question?.claimAmount && parseInt(question?.claimAmount) <= question?.upvotes * 1000;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h3">
          Question: {question?.content}
        </Typography>
        {` - Asker: ${asker}`}
        <br />
        {` - Upvotes: ${question?.upvotes}`}
        <br />
        {` - Claimed Token: ${question?.claimAmount}`}
        <br />
        {` - Question Vote Deadline: ${question?.voteDeadline.toLocaleString()}`}
        <br />
        {` - Answer Deadline: ${question?.answerDeadline.toLocaleString()}`}
        {question?.isMine && voteDeadlinePassed && voteRewardClaimable && (
          <LoadingButton
            sx={{ ml: 4, width: 400, mb: 1 }}
            variant="outlined"
            color="primary"
            onClick={() => {
              handleClaimRewardQuestionWrapper(question!);
            }}
            loading={rewardLoading}
            disabled={question.rewardClaimed}
          >
            <AdsClickIcon sx={{ mr: 1 }} />
            {question.rewardClaimed ? 'You Already Claimed Reward' : 'Claim Reward'}
          </LoadingButton>
        )}
        <Divider sx={{ m: 2 }} />
        {!question?.isMine && (
          <>
            {!voteDeadlinePassed && (
              <>
                <LoadingButton
                  variant="outlined"
                  onClick={() => {
                    handleUpvoteQuestionWrapper(question!);
                  }}
                  loading={upvoteLoading}
                  disabled={question?.upvoted}
                >
                  <ThumbUpIcon sx={{ mr: 1 }} />
                  {question?.upvoted ? 'Already Upvoted' : 'Upvote'}
                </LoadingButton>

                <Divider sx={{ m: 2 }} />
              </>
            )}
            {!answerDeadlinePassed && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Paper
                    component="form"
                    sx={{ ml: 5, p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
                  >
                    <InputBase
                      onChange={e => setAnswer(e.target.value)}
                      multiline
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Input your Answer here"
                      inputProps={{ 'aria-label': 'Input your Answer here' }}
                    />
                    <IconButton disabled type="button" sx={{ p: '10px' }} aria-label="Post">
                      <AddCommentIcon />
                    </IconButton>
                  </Paper>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      label="Claim token amount"
                      id="outlined-start-adornment"
                      sx={{ m: 2, width: '25ch' }}
                      InputProps={{
                        endAdornment: <InputAdornment position="start">token</InputAdornment>,
                      }}
                      onChange={handleClaimAmountChange}
                      error={claimAmountError}
                      helperText={'Amount must be 50~150'}
                    />
                    <LoadingButton
                      sx={{ width: 200 }}
                      color="secondary"
                      variant="outlined"
                      onClick={async () => {
                        setPostLoading(true);
                        await handlePostAnswer(question!, answer, claimAmount);
                        setPostLoading(false);
                        onClose();
                      }}
                      loading={postLoading}
                    >
                      Post Answer
                    </LoadingButton>
                  </Box>
                </Box>
                <Divider sx={{ m: 2 }} />
              </>
            )}
          </>
        )}
        <AnswerList
          answers={question?.answers || []}
          handleUpvote={handleUpvoteAnswerWrapper}
          question={question!}
          answerDeadlinePassed={answerDeadlinePassed}
          handleClaimReward={handleClaimRewardWrapper}
        />
      </Box>
    </Modal>
  );
};

export default QuestionModal;
