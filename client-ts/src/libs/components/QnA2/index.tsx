import React, { useCallback, useEffect, useState } from 'react';
import { Button, Grid, Box } from '@mui/material';
import { Contract, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { formatEther } from 'ethers/lib/utils';
import { Question } from '../../types/Question';
import { Answer } from '../../types/Answer';
import QuestionFeed from '../QuestionFeed';
import QuestionForm from '../QuestionForm';
import QuestionModal from '../QuestionModal';

interface QnAProps {
  QnAcontract: Contract | null;
  QaCoinContract: Contract | null;
}

// const VOTE_DURATION = 60 * 30 * 1000; // 30 minutes
const VOTE_DURATION = 60 * 60 * 24 * 3 * 1000; // 3 days
// const ANSWER_DURATION = 60 * 60 * 1000; // 1 hour
const ANSWER_DURATION = 60 * 60 * 24 * 7 * 1000; // 1 week

const QnA = ({ QnAcontract, QaCoinContract }: QnAProps) => {
  const { account } = useWeb3React();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleFetchQuestions = useCallback(async () => {
    if (!QnAcontract) return;
    try {
      const questionsLength = await QnAcontract.questionLength();
      setQuestions([]);
      for (let i = 0; i < questionsLength.toNumber(); i++) {
        const fetchedQuestion = await QnAcontract.questions(i);
        const upvoters = await QnAcontract.queryFilter(QnAcontract.filters.QuestionUpvoted(i), 0, 'latest');
        const upvoteAddrs = upvoters.map(e => e?.args?.voter);
        const answers = await QnAcontract.queryFilter(QnAcontract.filters.AnswerPosted(i), 0, 'latest');
        let answersFormatted: Answer[] = [];
        for (let j = 0; j < answers.length; j++) {
          const answerId = answers[j].args?.answerId.toNumber();
          const e = await QnAcontract.answers(i, answerId);
          const answerUpvoters = await QnAcontract.queryFilter(
            QnAcontract.filters.AnswerUpvoted(i, answerId),
            0,
            'latest',
          );
          const answerUpvoteAddrs = answerUpvoters.map(e => e?.args?.voter);
          answersFormatted.push({
            id: answerId,
            content: e.content,
            replier: e.replier,
            claimAmount: formatEther(e.reserve),
            isMine: account === e.replier,
            upvotes: e.upvotes.toNumber(),
            upvoted: answerUpvoteAddrs.includes(account as string),
            rewardClaimed: e.rewardClaimed,
          } as Answer);
        }
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
            upvoters: upvoteAddrs,
            upvoted: upvoteAddrs.includes(account as string),
            answers: answersFormatted,
            voteDeadline: new Date(fetchedQuestion.createdAt.toNumber() * 1000 + VOTE_DURATION),
            answerDeadline: new Date(fetchedQuestion.createdAt.toNumber() * 1000 + ANSWER_DURATION),
            rewardClaimed: fetchedQuestion.rewardClaimed,
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
  }, [handleFetchQuestions, postLoading]);

  const handlePostQuestion = async (question: string, claimAmount: number) => {
    if (!QnAcontract || !QaCoinContract || !account || !question) return;
    setPostLoading(true);
    try {
      const claimAmountBigNumber = ethers.utils.parseEther(claimAmount.toString());
      const allowance = await QaCoinContract.allowance(account, QnAcontract.address);
      if (allowance.lt(claimAmountBigNumber)) {
        const tx = await QaCoinContract.approve(QnAcontract.address, claimAmountBigNumber);
        await tx.wait();
      }
      const tx2 = await QnAcontract.postQuestion(question, claimAmountBigNumber);
      await tx2.wait();
      await handleFetchQuestions();
    } catch (error) {
      console.error("Error posting question:", error);
    } finally {
      setPostLoading(false);
    }
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

  const handlePostAnswer = async (question: Question, answer: string, claimAmount: number) => {
    if (!QnAcontract || !QaCoinContract || !account || !answer) return;
    const claimAmountBigNumber = ethers.utils.parseEther(claimAmount.toString());
    const allowance = await QaCoinContract.allowance(account, QnAcontract.address);
    if (allowance.lt(claimAmountBigNumber)) {
      const tx = await QaCoinContract.approve(QnAcontract.address, claimAmountBigNumber);
      await tx.wait();
    }
    const tx2 = await QnAcontract.postAnswer(question.id, answer, claimAmountBigNumber);
    await tx2.wait();
    handleFetchQuestions();
  };

  const handleUpvoteAnswer = async (question: Question, answer: Answer) => {
    if (!QnAcontract || !account) return;
    const tx = await QnAcontract.upvoteAnswer(question.id, answer.id);
    await tx.wait();
    handleFetchQuestions();
  };

  const handleClaimRewardQuestion = async (question: Question) => {
    if (!QnAcontract || !account) return;
    const tx = await QnAcontract.claimRewardQuestion(question.id);
    await tx.wait();
    handleFetchQuestions();
  };

  const handleClaimRewardAnswer = async (question: Question, answer: Answer) => {
    if (!QnAcontract || !account) return;
    const tx = await QnAcontract.claimRewardAnswer(question.id, answer.id);
    await tx.wait();
    handleFetchQuestions();
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', m: 3, height: '100vh' }}>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleFetchQuestions}
              sx={{bgcolor: '#fff', color: '#938AF8'}}
            >
              Fetch Questions
            </Button>
          </Grid>
          <Grid item xs={6}>
            {/* Empty grid item */}
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sx={{ height: '100%' }}>
            <QuestionFeed
              questions={questions}
              handleQuestionClick={handleQuestionClick}
            />
          </Grid>
          <Grid item xs={6} sx={{ height: '100%' }}>
            <QuestionForm
              handlePostQuestion={handlePostQuestion}
              postLoading={postLoading}
            />
          </Grid>
        </Grid>
      </Box>
      <QuestionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalQuestion(null);
        }}
        question={modalQuestion}
        handleUpvote={handleUpvote}
        handlePostAnswer={handlePostAnswer}
        handleUpvoteAnswer={handleUpvoteAnswer}
        handleClaimRewardQuestion={handleClaimRewardQuestion}
        handleClaimRewardAnswer={handleClaimRewardAnswer}
      />
    </Box>
  );
};

export default QnA;