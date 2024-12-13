"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Timer,
  ArrowDownToLine,
  Undo,
  Redo,
  RefreshCcw,
  Play,
  Pause,
  TimerReset,
  UserPen,
  Trophy,
  ChartBarBig,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const SCORE_SEQUENCE = ["00", "15", "30", "40", "AD"];

type ScoreState = {
  team1: {
    set1: number;
    set2: number;
    set3: number;
    game: number;
    score: string;
  };
  team2: {
    set1: number;
    set2: number;
    set3: number;
    game: number;
    score: string;
  };
};

export default function PadelScoreboard() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [team1, setTeam1] = useState({
    set1: 0,
    set2: 0,
    set3: 0,
    game: 0,
    score: "00",
  });
  const [team2, setTeam2] = useState({
    set1: 0,
    set2: 0,
    set3: 0,
    game: 0,
    score: "00",
  });
  const [history, setHistory] = useState<
    { team1: ScoreState["team1"]; team2: ScoreState["team2"] }[]
  >([]);
  const [future, setFuture] = useState<
    { team1: ScoreState["team1"]; team2: ScoreState["team2"] }[]
  >([]);
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMatchWon, setIsMatchWon] = useState(false);
  const [winningTeamStats, setWinningTeamStats] = useState<
    ScoreState["team1"] | null
  >(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [team1Name, setTeam1Name] = useState("Team 1");
  const [team2Name, setTeam2Name] = useState("Team 2");
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [allPreviousStats, setAllPreviousStats] = useState<any[]>([]);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [setTimeDurations, setSetTimeDurations] = useState([0, 0, 0]);
  const [currentSet, setCurrentSet] = useState(1);
  const [fullMatchTime, setFullMatchTime] = useState(0);
  const [lastScores, setLastScores] = useState<{
    set1: string;
    set2: string;
    set3: string;
  }>({ set1: "00", set2: "00", set3: "00" });
  const [lastGameScore, setLastGameScore] = useState<string>("00");

  const [lastScoresTeam1, setLastScoresTeam1] = useState<{
    set1: string;
    set2: string;
    set3: string;
  }>({ set1: "00", set2: "00", set3: "00" });

  const [lastScoresTeam2, setLastScoresTeam2] = useState<{
    set1: string;
    set2: string;
    set3: string;
  }>({ set1: "00", set2: "00", set3: "00" });

  const [lastGameScoreTeam1, setLastGameScoreTeam1] = useState<string>("00");
  const [lastGameScoreTeam2, setLastGameScoreTeam2] = useState<string>("00");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // ...existing code...
  useEffect(() => {
    if (isRunning && !isMatchWon) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTime((prevTime) => prevTime + 1);
          setFullMatchTime((prevTime) => prevTime + 1);
          if (currentSet === 3) {
            setSetTimeDurations((prev) => [prev[0], prev[1], prev[2] + 1]);
          }
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isMatchWon, currentSet]);
  // ...existing code...

  useEffect(() => {
    console.log(`Timer: ${formatTime(time)}`);
  }, [time]);

  const setCustomTimer = () => {
    const minutes = parseInt(customMinutes, 10);
    const seconds = parseInt(customSeconds, 10);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      setTime(minutes * 60 + seconds);
      setCustomMinutes("");
      setCustomSeconds("");
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const saveMatchStats = (
    team1Stats: ScoreState["team1"],
    team2Stats: ScoreState["team2"]
  ) => {
    const matchStats = {
      team1: { ...team1Stats, name: team1Name },
      team2: { ...team2Stats, name: team2Name },
      matchTime: formatTime(fullMatchTime), // Use full match time
      setTimes: setTimeDurations.map(formatTime),
    };
    const existingStats = JSON.parse(
      localStorage.getItem("allPreviousStats") || "[]"
    );
    existingStats.push(matchStats);
    localStorage.setItem("allPreviousStats", JSON.stringify(existingStats));
    setAllPreviousStats((prevStats) => [...prevStats, matchStats]);
  };

  const logMatchStats = (
    team1Stats: ScoreState["team1"],
    team2Stats: ScoreState["team2"]
  ) => {
    console.log("Match Stats:");
    console.log("Team 1:", team1Stats);
    console.log("Team 2:", team2Stats);
  };

  const updateScore = useCallback(
    (team: "team1" | "team2") => {
      setHistory((prev) => [...prev, { team1, team2 }]);
      setFuture([]);

      const currentTeam = team === "team1" ? team1 : team2;
      const otherTeam = team === "team1" ? team2 : team1;
      const setCurrentTeam = team === "team1" ? setTeam1 : setTeam2;
      const setOtherTeam = team === "team1" ? setTeam2 : setTeam1;

      const currentScore = currentTeam.score;
      const otherScore = otherTeam.score;
      let newScore =
        SCORE_SEQUENCE[SCORE_SEQUENCE.indexOf(currentScore) + 1] || "00";
      let newGame = currentTeam.game;
      let newSet1 = currentTeam.set1;
      let newSet2 = currentTeam.set2;
      let newSet3 = currentTeam.set3;

      // Scoring Logic
      if (currentScore === "AD" && otherScore === "40") {
        newGame += 1;
        newScore = "00";
        if (newGame >= 6 && newGame - otherTeam.game >= 2) {
          if (currentSet === 1) {
            newSet1 += 1;
            setLastScores((prev) => ({ ...prev, set1: newScore }));
            setLastGameScore(newScore);
            if (newSet1 === 2 || newSet2 === 2) {
              setPopupMessage(
                `${team === "team1" ? team1Name : team2Name} wins!`
              );
              setWinningTeamStats({
                ...currentTeam,
                set1: newSet1,
                set2: newSet2,
                set3: newSet3,
                game: newGame,
                score: newScore,
              });
              setIsPopupOpen(true);
              setIsMatchWon(true);
              saveMatchStats(team1, team2);
              logMatchStats(team1, team2);
              return;
            }
            setCurrentSet(2);
            setSetTimeDurations((prev) => [prev[0] + time, prev[1], prev[2]]);
          } else if (currentSet === 2) {
            newSet2 += 1;
            setLastScores((prev) => ({ ...prev, set2: newScore }));
            setLastGameScore(newScore);
            if (newSet1 === 2 || newSet2 === 2) {
              setPopupMessage(
                `${team === "team1" ? team1Name : team2Name} wins!`
              );
              setWinningTeamStats({
                ...currentTeam,
                set1: newSet1,
                set2: newSet2,
                set3: newSet3,
                game: newGame,
                score: newScore,
              });
              setIsPopupOpen(true);
              setIsMatchWon(true);
              saveMatchStats(team1, team2);
              logMatchStats(team1, team2);
              return;
            }
            setCurrentSet(3);
            setSetTimeDurations((prev) => [prev[0], prev[1] + time, prev[2]]);
          } else if (currentSet === 3) {
            newSet3 += 1;
            setLastScores((prev) => ({ ...prev, set3: newScore }));
            setLastGameScore(newScore);
            setSetTimeDurations((prev) => [prev[0], prev[1], prev[2] + time]);
            if (newSet3 === 2) {
              setIsRunning(false); // Stop the timer when set3 = 2
            }
          }
          newGame = 0;
          setTime(0); // Reset timer for the new set
        }
        setOtherTeam({ ...otherTeam, score: "00" });
      } else if (currentScore === "40" && otherScore === "AD") {
        newScore = "40";
        setOtherTeam({ ...otherTeam, score: "40" });
      } else if (currentScore === "40" && otherScore === "40") {
        newScore = "AD";
      } else if (currentScore === "AD") {
        newGame += 1;
        newScore = "00";
        if (newGame >= 6 && newGame - otherTeam.game >= 2) {
          if (currentSet === 1) {
            newSet1 += 1;
            setLastScores((prev) => ({ ...prev, set1: newScore }));
            setLastGameScore(newScore);
            if (newSet1 === 2 || newSet2 === 2) {
              setPopupMessage(
                `${team === "team1" ? team1Name : team2Name} wins!`
              );
              setWinningTeamStats({
                ...currentTeam,
                set1: newSet1,
                set2: newSet2,
                set3: newSet3,
                game: newGame,
                score: newScore,
              });
              setIsPopupOpen(true);
              setIsMatchWon(true);
              saveMatchStats(team1, team2);
              logMatchStats(team1, team2);
              return;
            }
            setCurrentSet(2);
            setSetTimeDurations((prev) => [prev[0] + time, prev[1], prev[2]]);
          } else if (currentSet === 2) {
            newSet2 += 1;
            setLastScores((prev) => ({ ...prev, set2: newScore }));
            setLastGameScore(newScore);
            if (newSet1 === 2 || newSet2 === 2) {
              setPopupMessage(
                `${team === "team1" ? team1Name : team2Name} wins!`
              );
              setWinningTeamStats({
                ...currentTeam,
                set1: newSet1,
                set2: newSet2,
                set3: newSet3,
                game: newGame,
                score: newScore,
              });
              setIsPopupOpen(true);
              setIsMatchWon(true);
              saveMatchStats(team1, team2);
              logMatchStats(team1, team2);
              return;
            }
            setCurrentSet(3);
            setSetTimeDurations((prev) => [prev[0], prev[1] + time, prev[2]]);
          } else if (currentSet === 3) {
            newSet3 += 1;
            setLastScores((prev) => ({ ...prev, set3: newScore }));
            setLastGameScore(newScore);
            setSetTimeDurations((prev) => [prev[0], prev[1], prev[2] + time]);
            if (newSet3 === 2) {
              setIsRunning(false); // Stop the timer when set3 = 2
            }
          }
          newGame = 0;
          setTime(0); // Reset timer for the new set
        }
        setOtherTeam({ ...otherTeam, score: "00" });
      } else if (currentScore === "40" && otherScore !== "40") {
        newGame += 1;
        newScore = "00";
        if (newGame >= 6 && newGame - otherTeam.game >= 2) {
          if (currentSet === 1) {
            newSet1 += 1;
            setLastScores((prev) => ({ ...prev, set1: newScore }));
            setLastGameScore(newScore);
            if (newSet1 === 2 || newSet2 === 2) {
              setPopupMessage(
                `${team === "team1" ? team1Name : team2Name} wins!`
              );
              setWinningTeamStats({
                ...currentTeam,
                set1: newSet1,
                set2: newSet2,
                set3: newSet3,
                game: newGame,
                score: newScore,
              });
              setIsPopupOpen(true);
              setIsMatchWon(true);
              saveMatchStats(team1, team2);
              logMatchStats(team1, team2);
              return;
            }
            setCurrentSet(2);
            setSetTimeDurations((prev) => [prev[0] + time, prev[1], prev[2]]);
          } else if (currentSet === 2) {
            newSet2 += 1;
            setLastScores((prev) => ({ ...prev, set2: newScore }));
            setLastGameScore(newScore);
            if (newSet1 === 2 || newSet2 === 2) {
              setPopupMessage(
                `${team === "team1" ? team1Name : team2Name} wins!`
              );
              setWinningTeamStats({
                ...currentTeam,
                set1: newSet1,
                set2: newSet2,
                set3: newSet3,
                game: newGame,
                score: newScore,
              });
              setIsPopupOpen(true);
              setIsMatchWon(true);
              saveMatchStats(team1, team2);
              logMatchStats(team1, team2);
              return;
            }
            setCurrentSet(3);
            setSetTimeDurations((prev) => [prev[0], prev[1] + time, prev[2]]);
          } else if (currentSet === 3) {
            newSet3 += 1;
            setLastScores((prev) => ({ ...prev, set3: newScore }));
            setLastGameScore(newScore);
            setSetTimeDurations((prev) => [prev[0], prev[1], prev[2] + time]);
            if (newSet3 === 2) {
              setIsRunning(false); // Stop the timer when set3 = 2
            }
          }
          newGame = 0;
          setTime(0); // Reset timer for the new set
        }
        setOtherTeam({ ...otherTeam, score: "00" });
      }

      if (
        ((newSet1 >= 2 || newSet2 >= 2 || newSet3 >= 2) &&
          (team1.set1 + team1.set2 + team1.set3 >= 2 ||
            team2.set1 + team2.set2 + team2.set3 >= 2)) ||
        team1.set1 + team1.set2 >= 2 ||
        team2.set1 + team2.set2 >= 2 ||
        (team1.set1 + team2.set1 === 1 &&
          team1.set2 + team2.set2 === 1 &&
          newSet3 === 2)
      ) {
        setPopupMessage(`${team === "team1" ? team1Name : team2Name} wins!`);
        setWinningTeamStats({
          ...currentTeam,
          set1: newSet1,
          set2: newSet2,
          set3: newSet3,
          game: newGame,
          score: newScore,
        });
        setIsPopupOpen(true);
        setIsMatchWon(true);
        saveMatchStats(team1, team2); // Save match stats to local storage
        logMatchStats(team1, team2); // Log match stats to console
      }

      if (team === "team1") {
        setLastScoresTeam1((prev) => ({
          ...prev,
          set1: newSet1.toString(),
          set2: newSet2.toString(),
          set3: newSet3.toString(),
        }));
        setLastGameScoreTeam1(newScore);
      } else {
        setLastScoresTeam2((prev) => ({
          ...prev,
          set1: newSet1.toString(),
          set2: newSet2.toString(),
          set3: newSet3.toString(),
        }));
        setLastGameScoreTeam2(newScore);
      }

      if (currentSet === 1 && newGame === 0) {
        setLastScores((prev) => ({ ...prev, set1: currentTeam.score }));
        setLastScoresTeam1((prev) => ({ ...prev, set1: team1.score }));
        setLastScoresTeam2((prev) => ({ ...prev, set1: team2.score }));
      } else if (currentSet === 2 && newGame === 0) {
        setLastScores((prev) => ({ ...prev, set2: currentTeam.score }));
        setLastScoresTeam1((prev) => ({ ...prev, set2: team1.score }));
        setLastScoresTeam2((prev) => ({ ...prev, set2: team2.score }));
      } else if (currentSet === 3 && newGame === 0) {
        setLastScores((prev) => ({ ...prev, set3: currentTeam.score }));
        setLastScoresTeam1((prev) => ({ ...prev, set3: team1.score }));
        setLastScoresTeam2((prev) => ({ ...prev, set3: team2.score }));
      }

      setCurrentTeam({
        ...currentTeam,
        score: newScore,
        game: newGame,
        set1: newSet1,
        set2: newSet2,
        set3: newSet3,
      });
    },
    [team1, team2, currentSet, time, isMatchWon]
  );

  const resetScores = () => {
    setTeam1({ set1: 0, set2: 0, set3: 0, game: 0, score: "00" });
    setTeam2({ set1: 0, set2: 0, set3: 0, game: 0, score: "00" });
    setHistory([]);
    setFuture([]);
    setIsPopupOpen(false);
    setIsMatchWon(false);
    setCurrentSet(1);
    setSetTimeDurations([0, 0, 0]);
    setTime(0);
    setFullMatchTime(0);
    setLastScores({ set1: "00", set2: "00", set3: "00" });
    setLastGameScore("00");
    setLastScoresTeam1({ set1: "00", set2: "00", set3: "00" });
    setLastGameScoreTeam1("00");
    setLastScoresTeam2({ set1: "00", set2: "00", set3: "00" });
    setLastGameScoreTeam2("00");
  };

  const undo = () => {
    if (history.length > 0) {
      const prevState = history.pop()!;
      setFuture((prev) => [{ team1, team2 }, ...prev]);
      setTeam1(prevState.team1);
      setTeam2(prevState.team2);
    }
  };

  const redo = () => {
    if (future.length > 0) {
      const nextState = future.shift()!;
      setHistory((prev) => [...prev, { team1, team2 }]);
      setTeam1(nextState.team1);
      setTeam2(nextState.team2);
    }
  };

  // Download as CSV functionality
  const downloadCSV = () => {
    const rows = [
      [
        "Team 1",
        "Set 1",
        "Set 2",
        "Set 3",
        "Games",
        "Score",
        "Team 2",
        "Set 1",
        "Set 2",
        "Set 3",
        "Games",
        "Score",
        "Match Time",
      ],
      ...allPreviousStats.map((stat) => [
        stat.team1.name,
        stat.team1.set1,
        stat.team1.set2,
        stat.team1.set3,
        stat.team1.game,
        stat.team1.score,
        stat.team2.name,
        stat.team2.set1,
        stat.team2.set2,
        stat.team2.set3,
        stat.team2.game,
        stat.team2.score,
        stat.matchTime,
      ]),
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "match_history.csv");
    document.body.appendChild(link);
    link.click();
  };

  const clearMatchHistory = () => {
    localStorage.removeItem("allPreviousStats");
    setAllPreviousStats([]);
  };

  useEffect(() => {
    const storedStats = JSON.parse(
      localStorage.getItem("allPreviousStats") || "[]"
    );
    setAllPreviousStats(storedStats);
  }, []);

  useEffect(() => {
    localStorage.setItem("allPreviousStats", JSON.stringify(allPreviousStats));
  }, [allPreviousStats]);

  return (
    <div className="min-h-screen flex  items-center bg-zinc-800 p-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="space-y-4">
          <Image
            className="w-full"
            alt="logo"
            src={"/logo.png"}
            height={200}
            width={1000}
          />
        </div>
        {/* Full Match Timer */}
        <div className="bg-zinc-900/50 rounded-lg p-4 text-4xl font-mono text-white text-center sm:text-2xl">
          {formatTime(fullMatchTime)}
        </div>
        <div className="flex justify-center gap-x-4 pb-4">
          <Button variant="ghost" size="icon" onClick={startTimer}>
            <Play className="w-6 h-6 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={stopTimer}>
            <Pause className="w-6 h-6 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetTimer}>
            <TimerReset className="w-6 h-6 text-gray-400" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center justify-center w-10 h-10 rounded-full  hover:bg-gray-200"
              >
                <Timer className="w-6 h-6 text-gray-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-6 max-w-md mx-auto sm:max-w-xs">
              <DialogHeader className="mb-4 text-white">
                <DialogTitle className="text-lg font-semibold text-gray-100">
                  Set Custom Timer
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex space-x-4 justify-center items-center">
                  <Input
                    id="custom-minutes"
                    placeholder="MM"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="p-2 rounded-md w-16 h-16 focus:ring text-gray-100 bg-zinc-800  border-zinc-700"
                  />
                  <p className="text-gray-100 text-2xl">:</p>
                  <Input
                    id="custom-seconds"
                    placeholder="SS"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    className="px-2 rounded-md w-16 h-16 focus:ring text-gray-100 bg-zinc-800 border border-zinc-700"
                  />
                </div>
                <Button
                  onClick={setCustomTimer}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-400 focus:ring focus:ring-blue-300"
                >
                  Set
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Headers */}
        <div className="grid grid-cols-6 gap-4 text-sm text-gray-300 text-center sm:text-xl">
          <div></div>
          <div>SET 1</div>
          <div>SET 2</div>
          <div>SET 3</div>
          <div>GAME</div>
          <div>SCORE</div>
        </div>

        {/* Team 1 */}
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="text-[#3498db] text-xl font-extrabold sm:text-3xl ">
            {team1Name}
          </div>
          <div className="text-center  text-white  text-xl sm:text-3xl">
            {team1.set1}
          </div>
          <div className="text-center  text-white  text-xl sm:text-3xl">
            {team1.set2}
          </div>
          <div className="text-center  text-white  text-xl sm:text-3xl">
            {team1.set3}
          </div>
          <div className="text-center  text-white  text-xl sm:text-3xl">
            {team1.game}
          </div>
          <Button
            className={`bg-[#3498db] text-white text-2xl font-bold  w-full h-full rounded-lg p-4 sm:text-3xl`}
            onClick={() => updateScore("team1")}
            disabled={isMatchWon}
          >
            {team1.score}
          </Button>
        </div>

        {/* Team 2 */}
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="text-[#9a9e95] text-lg font-extrabold sm:text-3xl  ">
            {team2Name}
          </div>
          <div className="text-center text-white text-xl sm:text-3xl">
            {team2.set1}
          </div>
          <div className="text-center text-white text-xl sm:text-3xl">
            {team2.set2}
          </div>
          <div className="text-center text-white text-xl sm:text-3xl">
            {team2.set3}
          </div>
          <div className="text-center text-white text-xl sm:text-3xl">
            {team2.game}
          </div>
          <Button
            className={`bg-[#454942] text-white text-2xl font-bold  w-full h-full rounded-lg p-4 sm:text-3xl`}
            onClick={() => updateScore("team2")}
            disabled={isMatchWon}
          >
            {team2.score}
          </Button>
        </div>
        {/* Duration */}
        <div className="grid grid-cols-6 gap-4  items-center">
          <div className="text-[#91989c] text-sm font-extrabold sm:text-3xl  ">
            Duration
          </div>
          <div className="text-center text-white text-lg sm:text-3xl ">
            {formatTime(setTimeDurations[0])} {/* Set 1 Duration */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {formatTime(setTimeDurations[1])} {/* Set 2 Duration */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {formatTime(setTimeDurations[2])} {/* Set 3 Duration */}
          </div>
        </div>

        <> 
        {/* last Scores  of Team1*/}
        <div className="grid grid-cols-6 items-center">
          <div className="text-[#5482e4] text-base font-extrabold sm:text-3xl  ">
            Last Scores of Team1
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastScores.set1} {/* Last score of Set 1 */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastScores.set2} {/* Last score of Set 2 */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastScores.set3} {/* Last score of Set 3 */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastGameScore} {/* Last score of game */}
          </div>
        </div>

        {/* Last Scores of Team 2 */}
        <div className="grid grid-cols-6 items-center">
          <div className="text-[#9eacb9] text-base font-extrabold sm:text-3xl">
            Last Scores of Team 2
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastScoresTeam2.set1} {/* Last score of Set 1 */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastScoresTeam2.set2} {/* Last score of Set 2 */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastScoresTeam2.set3} {/* Last score of Set 3 */}
          </div>
          <div className="text-center text-white text-lg sm:text-3xl">
            {lastGameScoreTeam2} {/* Last score of game */}
          </div>
        </div>
        </>

        {/* Controls */}
        <div className="flex justify-center gap-4 flex-wrap">
          {isMatchWon ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPopupOpen(true)}
            >
              <Trophy className="w-6 h-6 text-gray-400" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                resetScores();
                resetTimer();
              }}
            >
              <RefreshCcw className="w-6 h-6 text-gray-400" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={history.length === 0}
          >
            <Undo className="w-6 h-6 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={future.length === 0}
          >
            <Redo className="w-6 h-6 text-gray-400" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNameDialogOpen(true)}
          >
            <UserPen className="w-6 h-6 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsStatsDialogOpen(true)}
          >
            <ChartBarBig className="w-6 h-6 text-gray-400" />
          </Button>
          <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
            <DialogContent className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-6 max-w-md mx-auto sm:max-w-xs">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-semibold text-gray-100">
                  Set Team Names
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <Input
                  id="team1-name"
                  placeholder="Team 1 Name"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  className="w-full px-4 py-2  rounded-md focus:ring border border-zinc-700  text-gray-100"
                />
                <Input
                  id="team2-name"
                  placeholder="Team 2 Name"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  className="w-full px-4 py-2  rounded-md focus:ring border border-zinc-700  text-gray-100"
                />
                <Button
                  onClick={() => setIsNameDialogOpen(false)}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-400 focus:ring"
                >
                  Set
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
            <DialogContent className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-bold text-blue-400 text-center">
                  Match History
                </DialogTitle>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={downloadCSV}
                    className=""
                  >
                    <ArrowDownToLine className="w-6 h-6 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMatchHistory}
                    className=""
                  >
                    <Trash className="w-6 h-6 text-gray-400 hover:text-red-700" />
                  </Button>
                </div>
              </DialogHeader>
                <ScrollArea className="rounded-md w-full h-96 overflow-auto">
                <Table className="">
                  <TableHeader>
                  <TableRow className="bg-zinc-800">
                    <TableHead className="text-zinc-300 text-right">
                    Team 1
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Set 1
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Set 2
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Set 3
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Games
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Score
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Team 2
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Set 1
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Set 2
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Set 3
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Games
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Score
                    </TableHead>
                    <TableHead className="text-zinc-300 text-right">
                    Match Time
                    </TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {allPreviousStats.map((stat, index) => (
                    <TableRow
                    key={index}
                    className="border-b border-zinc-700 text-right"
                    >
                    <TableCell className="font-medium text-right text-zinc-300 ">
                      {stat.team1.name}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team1.set1}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team1.set2}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team1.set3}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team1.game}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team1.score}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-300">
                      {stat.team2.name}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team2.set1}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team2.set2}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team2.set3}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team2.game}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {stat.team2.score}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {stat.matchTime}
                    </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
                </ScrollArea>
              <Button
                onClick={() => setIsStatsDialogOpen(false)}
                className="mt-6 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-400"
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Popup */}
        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-700 border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-400 flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                {popupMessage}
              </DialogTitle>
            </DialogHeader>
            {winningTeamStats && (
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-zinc-400">Set1</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {winningTeamStats.set1}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-zinc-400">Set2</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {winningTeamStats.set2}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-zinc-400">Set3</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {winningTeamStats.set3}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-zinc-400">Games</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {winningTeamStats.game}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-zinc-400">Score</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {winningTeamStats.score}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsPopupOpen(false);
                  resetScores();
                  resetTimer();
                }}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-400 text-white"
              >
                Close and Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
