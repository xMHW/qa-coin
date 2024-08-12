// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./QaCoin.sol";

contract QnA {
    QaCoin public token;

    struct Question {
        uint256 id;
        address asker;
        string content;
        uint256 reserve;
        uint256 createdAt;
        bool rewardClaimed;
        uint256 upvotes;
    }

    struct Answer {
        uint256 id;
        address replier;
        string content;
        uint256 upvotes;
        uint256 reserve;
        bool rewardClaimed;
        uint256 createdAt;
    }


    uint256 public nextAnswerId;
    Question[] public questions;
    mapping(uint256 => mapping(uint256 => Answer)) public answers;
    mapping(uint256 => uint256) public answerUpvotesOfQuestion;
    mapping(uint256 => bool) public answerUpvotesOfQuestionSet;
    mapping(address => uint256) public recentUpvoteRewardTime;

    uint256 public upvoteDeadline = 3 days;
    uint256 public answerDeadline = 7 days;

    event QuestionPosted(
        uint256 questionId,
        address asker,
        string content,
        uint256 reserve 
    );
    event QuestionUpvoted(uint256 indexed questionId, address voter);
    event AnswerPosted(uint256 indexed questionId, uint256 answerId, address replier, string content, uint256 reserve);
    event AnswerUpvoted(
        uint256 indexed questionId,
        uint256 indexed answerId,
        address voter
    );

    constructor(address tokenAddress) {
        token = QaCoin(tokenAddress);
    }

    function questionLength() external view returns (uint256) {
        return questions.length;
    }

    function postQuestion(string calldata content, uint256 reserve) external {
        require(
            token.transferFrom(msg.sender, address(this), reserve),
            "Failed to transfer tokens"
        );
        uint256 id = questions.length;
        questions.push(
            Question(id, msg.sender, content, reserve, block.timestamp, false, 0)
        );
        answerUpvotesOfQuestionSet[id] = false;
        emit QuestionPosted(id, msg.sender, content, reserve);
    }

    function upvoteQuestion(uint256 questionId) external {
        require(
            block.timestamp <= questions[questionId].createdAt + upvoteDeadline,
            "Voting deadline has passed"
        );
        Question storage question = questions[questionId];
        question.upvotes += 1;
        emit QuestionUpvoted(questionId, msg.sender);
    }

    function postAnswer(uint256 questionId, string calldata content, uint256 tokens) external {
        require(
            block.timestamp <= questions[questionId].createdAt + answerDeadline,
            "Answer deadline has passed"
        );
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "Failed to transfer tokens"
        );
        uint256 id = nextAnswerId++;
        answers[questionId][id] = Answer(id, msg.sender, content, 0, tokens, false, block.timestamp);
        emit AnswerPosted(questionId, id, msg.sender, content, tokens);
    }

    function upvoteAnswer(
        uint256 questionId,
        uint256 answerId
    ) external {
        require(
            block.timestamp <= questions[questionId].createdAt + answerDeadline,
            "Voting deadline has passed"
        );
        Answer storage answer = answers[questionId][answerId];
        answer.upvotes += 1;
        if (!answerUpvotesOfQuestionSet[questionId]) {
            answerUpvotesOfQuestionSet[questionId] = true;
            answerUpvotesOfQuestion[questionId] = answerId;
        } else {
            uint256 currentAnswerId = answerUpvotesOfQuestion[questionId];
            if (answers[questionId][currentAnswerId].upvotes < answer.upvotes) {
                answerUpvotesOfQuestion[questionId] = answerId;
            }
        }
        emit AnswerUpvoted(questionId, answerId, msg.sender);
    }

    function claimRewardQuestion(uint256 questionId) external {
        Question storage question = questions[questionId];
        require(!question.rewardClaimed, "reward already claimed");
        require(
            block.timestamp > question.createdAt + answerDeadline,
            "Deadline not yet passed"
        );
        require(question.asker == msg.sender, "Only asker can claim reserve");
        require(
            (question.upvotes * 100) >= question.reserve,
            "Question did not get enough upvotes"
        );

        token.transfer(question.asker, question.reserve);
        question.rewardClaimed = true;
    }

    function claimRewardAnswer(uint256 questionId, uint256 answerId) external {
        Answer storage answer = answers[questionId][answerId];
        require(!answer.rewardClaimed, "reward already claimed");
        require(
            block.timestamp > questions[questionId].createdAt + answerDeadline,
            "Deadline not yet passed"
        );
        require(answer.replier == msg.sender, "Only replier can claim reward");
        require(answer.upvotes > 0, "Answer has no upvotes");
        if (answerId == answerUpvotesOfQuestion[questionId]) {
            token.transfer(answer.replier, answer.reserve * 3);
        } else {
            token.transfer(answer.replier, answer.reserve * 2);
        }
        answer.rewardClaimed = true;
    }
}
