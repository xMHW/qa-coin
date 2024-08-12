import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';
import { Box, Button, IconButton, InputAdornment, InputBase, Paper, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { formatEther } from 'ethers/lib/utils';
import { Question } from '../../types/Question';
import QuestionList from '../QuestionList';
import QuestionModal from '../QuestionModal';

interface QnAProps {
  QnAcontract: Contract | null;
  QaCoinContract: Contract | null;
}

const QnA = ({ QnAcontract, QaCoinContract }: QnAProps) => {
  const { account } = useWeb3React();
  const [question, setQuestion] = useState<string>('');
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [claimAmount, setClaimAmount] = useState<number>(100);
  const [claimAmountError, setClaimAmountError] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleFetchQuestions = useCallback(async () => {
    if (!QnAcontract) return;
    try {
      const questionsLength = await QnAcontract.questionLength();
      setQuestions([]);
      for (let i = 0; i < questionsLength.toNumber(); i++) {
        const fetchedQuestion = await QnAcontract.questions(i);
        console.log(fetchedQuestion.id.toNumber(), 'question');
        setQuestions(prev => [
          ...prev,
          {
            id: fetchedQuestion.id.toNumber(),
            content: fetchedQuestion.content,
            claimAmount: formatEther(fetchedQuestion.reserve),
            upvotes: fetchedQuestion.upvotes.toNumber(),
            createdAt: new Date(fetchedQuestion.createdAt.toNumber() * 1000).toLocaleString(),
            asker: fetchedQuestion.asker,
            isMine: account === fetchedQuestion.asker,
          },
        ]);
      }
    } catch (e) {
      console.error(e, "Can't fetch questions");
    }
  }, [QnAcontract, account]);

  useEffect(() => {
    if (postLoading) return;
    handleFetchQuestions();
  }, [QnAcontract, handleFetchQuestions, postLoading]);

  const handleClaimAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(e.target.value);
    if (amount < 100 || amount > 1000) {
      setClaimAmountError(true);
    } else {
      setClaimAmountError(false);
      setClaimAmount(amount);
    }
  };

  const handlePostQuestion = async () => {
    if (!QnAcontract || !QaCoinContract || !account || !question || claimAmountError) return;
    setPostLoading(true);
    const claimAmountBigNumber = ethers.utils.parseEther(claimAmount.toString());
    const allowance = await QaCoinContract.allowance(account, QnAcontract.address);
    console.log(formatEther(allowance), 'allowance');
    if (allowance.lt(claimAmountBigNumber)) {
      const tx = await QaCoinContract.approve(QnAcontract.address, claimAmountBigNumber);
      await tx.wait();
    }
    const tx2 = await QnAcontract.postQuestion(question, claimAmountBigNumber);
    await tx2.wait();
    setPostLoading(false);
  };

  const handleQuestionClick = (question: Question) => {
    setModalQuestion(question);
    setModalOpen(true);
  };

  const handleUpvote = async (question: Question) => {
    if (!QnAcontract || !account) return;
    const tx = await QnAcontract.upvoteQuestion(question.id);
    await tx.wait();
    handleFetchQuestions();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button sx={{ mt: 5, width: 200 }} color="inherit" variant="outlined" onClick={handleFetchQuestions}>
        Fetch Questions
      </Button>
      <Box sx={{ height: 20 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper component="form" sx={{ ml: 5, p: '2px 4px', display: 'flex', alignItems: 'center', width: 1200 }}>
          <InputBase
            onChange={e => setQuestion(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
            placeholder="Input your question here"
            inputProps={{ 'aria-label': 'Input your question here"' }}
          />
          <IconButton disabled type="button" sx={{ p: '10px' }} aria-label="Post">
            <QuestionMarkIcon />
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
            helperText={'Amount must be 100~1000'}
          />
          <LoadingButton
            sx={{ width: 200 }}
            color="secondary"
            variant="outlined"
            onClick={handlePostQuestion}
            loading={postLoading}
          >
            Post Question
          </LoadingButton>
        </Box>
      </Box>
      <QuestionList questions={questions} handleQuestionClick={handleQuestionClick} />
      <QuestionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalQuestion(null);
        }}
        question={modalQuestion}
        handleUpvote={handleUpvote}
      />
    </Box>
  );
};

export default QnA;
